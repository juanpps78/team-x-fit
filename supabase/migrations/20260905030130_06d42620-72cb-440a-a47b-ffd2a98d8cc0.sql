-- 1. Catálogo de ejercicios
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS equipment TEXT NOT NULL DEFAULT 'Peso corporal',
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS exercises_muscle_idx ON public.exercises (muscle);

-- 2. Rutinas: objetivo y notas por ejercicio
ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS goal TEXT NOT NULL DEFAULT 'Ganar músculo';

ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Borrado en cascada de rutinas/días, preservando historial
ALTER TABLE public.workout_days DROP CONSTRAINT IF EXISTS workout_days_plan_id_fkey;
ALTER TABLE public.workout_days
  ADD CONSTRAINT workout_days_plan_id_fkey FOREIGN KEY (plan_id)
  REFERENCES public.workout_plans(id) ON DELETE CASCADE;

ALTER TABLE public.workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_day_id_fkey;
ALTER TABLE public.workout_exercises
  ADD CONSTRAINT workout_exercises_day_id_fkey FOREIGN KEY (day_id)
  REFERENCES public.workout_days(id) ON DELETE CASCADE;

ALTER TABLE public.workout_sessions DROP CONSTRAINT IF EXISTS workout_sessions_day_id_fkey;
ALTER TABLE public.workout_sessions
  ADD CONSTRAINT workout_sessions_day_id_fkey FOREIGN KEY (day_id)
  REFERENCES public.workout_days(id) ON DELETE SET NULL;

ALTER TABLE public.exercise_sets DROP CONSTRAINT IF EXISTS exercise_sets_workout_exercise_id_fkey;
ALTER TABLE public.exercise_sets
  ADD CONSTRAINT exercise_sets_workout_exercise_id_fkey FOREIGN KEY (workout_exercise_id)
  REFERENCES public.workout_exercises(id) ON DELETE SET NULL;

-- 4. Normalizar categorías y completar datos de los 7 ejercicios actuales
UPDATE public.exercises SET muscle = 'Pecho', equipment = 'Barra',
  description = 'Tumbado en banco plano, baja la barra al pecho y empuja hasta extender los brazos.'
  WHERE slug = 'press-banca';
UPDATE public.exercises SET muscle = 'Tríceps', equipment = 'Peso corporal',
  description = 'En paralelas, baja flexionando los codos y sube extendiendo los brazos.'
  WHERE slug = 'fondos';
UPDATE public.exercises SET muscle = 'Pecho', equipment = 'Mancuernas',
  description = 'Banco a 45°, empuja las mancuernas desde el pecho hasta arriba.'
  WHERE slug = 'press-inclinado-mancuernas';
UPDATE public.exercises SET muscle = 'Pecho', equipment = 'Mancuernas',
  description = 'Abre los brazos en cruz con codos ligeramente flexionados y cierra controlando.'
  WHERE slug = 'aperturas-mancuernas';
UPDATE public.exercises SET muscle = 'Tríceps', equipment = 'Polea',
  description = 'De pie frente a la polea alta, extiende los codos manteniendo los brazos pegados.'
  WHERE slug = 'extension-triceps-polea';
UPDATE public.exercises SET muscle = 'Tríceps', equipment = 'Mancuerna',
  description = 'Sentado, baja la mancuerna tras la nuca y extiende los codos hacia arriba.'
  WHERE slug = 'extension-triceps';
UPDATE public.exercises SET muscle = 'Tríceps', equipment = 'Barra Z',
  description = 'Tumbado, baja la barra hacia la frente flexionando solo los codos.'
  WHERE slug = 'press-frances';

-- 5. Nuevos ejercicios del catálogo
INSERT INTO public.exercises (slug, name, muscle, image_key, equipment, description) VALUES
  ('sentadilla-barra','Sentadilla con barra','Piernas','sentadilla-barra','Barra','Con la barra en la espalda, baja hasta que los muslos queden paralelos al suelo y sube.'),
  ('prensa-piernas','Prensa de piernas','Piernas','prensa-piernas','Máquina','Empuja la plataforma con los pies apoyados, sin bloquear las rodillas al final.'),
  ('extension-cuadriceps','Extensión de cuádriceps','Piernas','extension-cuadriceps','Máquina','Sentado, extiende las rodillas hasta arriba y baja controlando el peso.'),
  ('curl-femoral','Curl femoral','Piernas','curl-femoral','Máquina','Flexiona las rodillas llevando el rodillo hacia los glúteos y baja despacio.'),
  ('dominadas','Dominadas','Espalda','dominadas','Peso corporal','Cuelga de la barra y sube hasta pasar la barbilla por encima de la barra.'),
  ('remo-barra','Remo con barra','Espalda','remo-barra','Barra','Con el torso inclinado, lleva la barra al abdomen juntando las escápulas.'),
  ('jalon-al-pecho','Jalón al pecho','Espalda','jalon-al-pecho','Polea','Sentado, tira de la barra hasta la parte alta del pecho y sube controlando.'),
  ('press-militar','Press militar','Hombros','press-militar','Barra','De pie, empuja la barra desde los hombros hasta extender los brazos arriba.'),
  ('elevaciones-laterales','Elevaciones laterales','Hombros','elevaciones-laterales','Mancuernas','Sube las mancuernas a los lados hasta la altura de los hombros.'),
  ('curl-barra','Curl de bíceps con barra','Bíceps','curl-barra','Barra','De pie, flexiona los codos subiendo la barra sin mover los hombros.'),
  ('curl-martillo','Curl martillo','Bíceps','curl-martillo','Mancuernas','Con agarre neutro, flexiona los codos alternando o a la vez.'),
  ('hip-thrust','Hip thrust','Glúteos','hip-thrust','Barra','Con la espalda apoyada en un banco, eleva la cadera apretando los glúteos.'),
  ('peso-muerto-rumano','Peso muerto rumano','Glúteos','peso-muerto-rumano','Barra','Baja la barra pegada a las piernas con la espalda recta y sube con la cadera.'),
  ('plancha-abdominal','Plancha abdominal','Core','plancha-abdominal','Peso corporal','Apoyado en antebrazos y pies, mantén el cuerpo en línea recta.'),
  ('carrera-cinta','Carrera en cinta','Cardio','carrera-cinta','Máquina','Carrera continua en cinta a ritmo constante para el trabajo cardiovascular.')
ON CONFLICT (slug) DO NOTHING;