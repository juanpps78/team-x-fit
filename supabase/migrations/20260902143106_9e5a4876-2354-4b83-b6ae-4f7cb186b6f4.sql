
-- Perfil
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Atleta',
  goal TEXT NOT NULL DEFAULT 'Ganar masa muscular',
  level TEXT NOT NULL DEFAULT 'Intermedio',
  days_per_week INT NOT NULL DEFAULT 4,
  minutes_per_session INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Catálogo de ejercicios (global)
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  muscle TEXT NOT NULL,
  image_key TEXT NOT NULL DEFAULT 'press-banca',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read exercises" ON public.exercises FOR SELECT TO authenticated USING (true);

-- Rutinas
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT ALL ON public.workout_plans TO service_role;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans" ON public.workout_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.workout_plans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_order INT NOT NULL DEFAULT 1,
  estimated_minutes INT NOT NULL DEFAULT 55,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_days TO authenticated;
GRANT ALL ON public.workout_days TO service_role;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own days" ON public.workout_days FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.workout_days ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 1,
  sets INT NOT NULL DEFAULT 4,
  reps INT NOT NULL DEFAULT 10,
  target_weight NUMERIC NOT NULL DEFAULT 0,
  rest_seconds INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_exercises TO authenticated;
GRANT ALL ON public.workout_exercises TO service_role;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workout exercises" ON public.workout_exercises FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Entrenamientos realizados
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_id UUID REFERENCES public.workout_days ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  total_sets INT NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sessions TO service_role;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.workout_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions ON DELETE CASCADE,
  workout_exercise_id UUID REFERENCES public.workout_exercises ON DELETE SET NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  sets INT NOT NULL DEFAULT 1,
  reps INT NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_sets TO authenticated;
GRANT ALL ON public.exercise_sets TO service_role;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sets" ON public.exercise_sets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX ON public.exercise_sets (session_id);
CREATE INDEX ON public.workout_sessions (user_id, started_at DESC);
CREATE INDEX ON public.workout_exercises (day_id, position);

-- Catálogo inicial
INSERT INTO public.exercises (slug, name, muscle, image_key) VALUES
  ('press-banca','Press de banca','Pecho','press-banca'),
  ('press-inclinado-mancuernas','Press inclinado con mancuernas','Pecho','mancuernas'),
  ('aperturas-mancuernas','Aperturas con mancuernas','Pecho','mancuernas'),
  ('fondos','Fondos','Pecho','press-banca'),
  ('extension-triceps-polea','Extensión de tríceps en polea','Tríceps','triceps'),
  ('press-frances','Press francés','Tríceps','triceps'),
  ('extension-triceps','Extensión de tríceps','Tríceps','triceps');

-- Bootstrap: perfil + rutina inicial
CREATE OR REPLACE FUNCTION public.bootstrap_user(_name TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  plan UUID;
  day UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO public.profiles (id, name)
  VALUES (uid, COALESCE(NULLIF(_name, ''), 'Atleta'))
  ON CONFLICT (id) DO NOTHING;

  IF EXISTS (SELECT 1 FROM public.workout_plans WHERE user_id = uid) THEN RETURN; END IF;

  INSERT INTO public.workout_plans (user_id, name) VALUES (uid, 'Rutina TEAM-X') RETURNING id INTO plan;
  INSERT INTO public.workout_days (plan_id, user_id, title, day_order, estimated_minutes)
  VALUES (plan, uid, 'Pecho + Tríceps', 1, 55) RETURNING id INTO day;

  INSERT INTO public.workout_exercises (day_id, exercise_id, user_id, position, sets, reps, target_weight, rest_seconds)
  SELECT day, e.id, uid, v.position, v.sets, v.reps, v.target_weight, v.rest_seconds
  FROM (VALUES
    ('press-banca', 1, 4, 10, 60, 90),
    ('press-inclinado-mancuernas', 2, 4, 10, 24, 90),
    ('aperturas-mancuernas', 3, 4, 12, 14, 60),
    ('fondos', 4, 4, 10, 0, 90),
    ('extension-triceps-polea', 5, 4, 12, 30, 60),
    ('press-frances', 6, 4, 10, 25, 75),
    ('extension-triceps', 7, 4, 12, 12, 60)
  ) AS v(slug, position, sets, reps, target_weight, rest_seconds)
  JOIN public.exercises e ON e.slug = v.slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_user(TEXT) TO authenticated;
