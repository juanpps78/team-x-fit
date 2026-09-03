import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { exerciseImage } from "./exercise-images";
import type { Exercise, LoggedExercise, User } from "./teamx-data";

type WorkoutDay = { id: string; title: string; estimatedMinutes: number };

type SessionState = {
  id: string | null;
  currentIndex: number;
  logs: LoggedExercise[];
  startedAt: number | null;
  finished: boolean;
};

const emptySession: SessionState = {
  id: null,
  currentIndex: 0,
  logs: [],
  startedAt: null,
  finished: false,
};

type HistoryPoint = { week: string; volumen: number };
type Record_ = { name: string; value: number };

type Ctx = {
  loading: boolean;
  user: User;
  day: WorkoutDay;
  exercises: Exercise[];
  session: SessionState;
  history: HistoryPoint[];
  records: Record_[];
  lastWorkout: { title: string; when: string; minutes: number; volume: number };
  startWorkout: () => Promise<void>;
  logExercise: (log: LoggedExercise) => Promise<void>;
  resetWorkout: () => void;
  totals: { volume: number; sets: number; minutes: number; deltaPct: number };
};

const WorkoutContext = createContext<Ctx | null>(null);

const fallbackUser: User = {
  name: "Atleta",
  goal: "Ganar masa muscular",
  level: "Intermedio",
  daysPerWeek: 4,
  minutesPerSession: 60,
  totalWorkouts: 0,
  streak: 0,
};

function relativeDay(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `Hace ${diff} días`;
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>(fallbackUser);
  const [day, setDay] = useState<WorkoutDay>({ id: "", title: "Mi rutina", estimatedMinutes: 55 });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [session, setSession] = useState<SessionState>(emptySession);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [records, setRecords] = useState<Record_[]>([]);
  const [lastWorkout, setLastWorkout] = useState({
    title: "Sin entrenamientos",
    when: "—",
    minutes: 0,
    volume: 0,
  });

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    await supabase.rpc("bootstrap_user", {
      _name: (auth.user?.user_metadata?.["name"] as string | undefined) ?? "Atleta",
    });

    const [profileRes, dayRes, sessionsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase
        .from("workout_days")
        .select("id, title, estimated_minutes")
        .order("day_order")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workout_sessions")
        .select("id, started_at, finished_at, total_volume, total_sets, duration_minutes, day_id")
        .order("started_at", { ascending: true }),
    ]);

    const finished = (sessionsRes.data ?? []).filter((s) => s.finished_at);
    const profile = profileRes.data;

    if (profile) {
      setUser({
        name: profile.name,
        goal: profile.goal,
        level: profile.level,
        daysPerWeek: profile.days_per_week,
        minutesPerSession: profile.minutes_per_session,
        totalWorkouts: finished.length,
        streak: finished.length,
      });
    }

    const dayRow = dayRes.data;
    if (dayRow) {
      setDay({ id: dayRow.id, title: dayRow.title, estimatedMinutes: dayRow.estimated_minutes });

      const { data: wex } = await supabase
        .from("workout_exercises")
        .select("id, sets, reps, target_weight, rest_seconds, position, exercises(name, muscle, image_key)")
        .eq("day_id", dayRow.id)
        .order("position");

      setExercises(
        (wex ?? []).map((w) => ({
          id: w.id,
          name: w.exercises?.name ?? "Ejercicio",
          muscle: w.exercises?.muscle ?? "",
          image: exerciseImage(w.exercises?.image_key ?? "press-banca"),
          sets: w.sets,
          reps: w.reps,
          targetWeight: Number(w.target_weight),
          restSeconds: w.rest_seconds,
        })),
      );
    }

    setHistory(
      finished.slice(-7).map((s, i) => ({ week: `S${i + 1}`, volumen: Number(s.total_volume) })),
    );

    const last = finished[finished.length - 1];
    if (last) {
      setLastWorkout({
        title: dayRow?.title ?? "Entrenamiento",
        when: relativeDay(last.started_at),
        minutes: last.duration_minutes,
        volume: Number(last.total_volume),
      });
    }

    const { data: bestSets } = await supabase
      .from("exercise_sets")
      .select("weight, exercises(name)")
      .order("weight", { ascending: false })
      .limit(50);
    const best = new Map<string, number>();
    for (const s of bestSets ?? []) {
      const name = s.exercises?.name;
      if (!name) continue;
      if (!best.has(name)) best.set(name, Number(s.weight));
    }
    setRecords([...best.entries()].slice(0, 3).map(([name, value]) => ({ name, value })));

    const open = (sessionsRes.data ?? []).find((s) => !s.finished_at);
    if (open) {
      const { data: logs } = await supabase
        .from("exercise_sets")
        .select("workout_exercise_id, weight, reps, sets, notes")
        .eq("session_id", open.id)
        .order("created_at");
      const mapped: LoggedExercise[] = (logs ?? []).map((l) => ({
        exerciseId: l.workout_exercise_id ?? "",
        weight: Number(l.weight),
        reps: l.reps,
        sets: l.sets,
        ...(l.notes ? { notes: l.notes } : {}),
      }));
      setSession({
        id: open.id,
        logs: mapped,
        currentIndex: mapped.length,
        startedAt: new Date(open.started_at).getTime(),
        finished: false,
      });
    } else {
      setSession(emptySession);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startWorkout = useCallback(async () => {
    if (session.id) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid || !day.id) return;
    const { data } = await supabase
      .from("workout_sessions")
      .insert({ user_id: uid, day_id: day.id })
      .select("id, started_at")
      .single();
    if (data) {
      setSession({ ...emptySession, id: data.id, startedAt: new Date(data.started_at).getTime() });
    }
  }, [session.id, day.id]);

  const resetWorkout = useCallback(() => setSession(emptySession), []);

  const logExercise = useCallback(
    async (log: LoggedExercise) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid || !session.id) return;

      const { data: wex } = await supabase
        .from("workout_exercises")
        .select("exercise_id")
        .eq("id", log.exerciseId)
        .maybeSingle();

      if (wex) {
        await supabase.from("exercise_sets").insert({
          session_id: session.id,
          workout_exercise_id: log.exerciseId,
          exercise_id: wex.exercise_id,
          user_id: uid,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          notes: log.notes ?? null,
        });
      }

      const logs = [...session.logs.filter((l) => l.exerciseId !== log.exerciseId), log];
      const finished = logs.length >= exercises.length && exercises.length > 0;

      if (finished) {
        const volume = logs.reduce((a, l) => a + l.weight * l.reps * l.sets, 0);
        const sets = logs.reduce((a, l) => a + l.sets, 0);
        const minutes = session.startedAt
          ? Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))
          : day.estimatedMinutes;
        await supabase
          .from("workout_sessions")
          .update({
            finished_at: new Date().toISOString(),
            total_volume: volume,
            total_sets: sets,
            duration_minutes: minutes,
          })
          .eq("id", session.id);
      }

      setSession((prev) => ({
        ...prev,
        logs,
        currentIndex: Math.min(prev.currentIndex + 1, exercises.length),
        finished,
      }));
    },
    [session, exercises.length, day.estimatedMinutes],
  );

  const totals = useMemo(() => {
    const volume = session.logs.reduce((acc, l) => acc + l.weight * l.reps * l.sets, 0);
    const sets = session.logs.reduce((acc, l) => acc + l.sets, 0);
    const minutes = session.startedAt
      ? Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))
      : day.estimatedMinutes;
    const deltaPct = lastWorkout.volume
      ? Math.round(((volume - lastWorkout.volume) / lastWorkout.volume) * 100)
      : 0;
    return { volume, sets, minutes, deltaPct };
  }, [session, lastWorkout.volume, day.estimatedMinutes]);

  const value = useMemo(
    () => ({
      loading,
      user,
      day,
      exercises,
      session,
      history,
      records,
      lastWorkout,
      startWorkout,
      logExercise,
      resetWorkout,
      totals,
    }),
    [
      loading,
      user,
      day,
      exercises,
      session,
      history,
      records,
      lastWorkout,
      startWorkout,
      logExercise,
      resetWorkout,
      totals,
    ],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout debe usarse dentro de WorkoutProvider");
  return ctx;
}
