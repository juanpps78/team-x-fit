import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoUser, exercises, lastWorkout, type LoggedExercise, type User } from "./teamx-data";

type SessionState = {
  currentIndex: number;
  logs: LoggedExercise[];
  startedAt: number | null;
  finished: boolean;
};

const emptySession: SessionState = {
  currentIndex: 0,
  logs: [],
  startedAt: null,
  finished: false,
};

type Ctx = {
  user: User;
  session: SessionState;
  startWorkout: () => void;
  logExercise: (log: LoggedExercise) => void;
  resetWorkout: () => void;
  totals: { volume: number; sets: number; minutes: number; deltaPct: number };
};

const WorkoutContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "teamx.session.v1";

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(emptySession);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as SessionState);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* noop */
    }
  }, [session]);

  const startWorkout = useCallback(() => {
    setSession({ ...emptySession, startedAt: Date.now() });
  }, []);

  const resetWorkout = useCallback(() => setSession(emptySession), []);

  const logExercise = useCallback((log: LoggedExercise) => {
    setSession((prev) => {
      const logs = [...prev.logs.filter((l) => l.exerciseId !== log.exerciseId), log];
      const nextIndex = prev.currentIndex + 1;
      return {
        ...prev,
        logs,
        currentIndex: Math.min(nextIndex, exercises.length),
        finished: nextIndex >= exercises.length,
      };
    });
  }, []);

  const totals = useMemo(() => {
    const volume = session.logs.reduce((acc, l) => acc + l.weight * l.reps * l.sets, 0);
    const sets = session.logs.reduce((acc, l) => acc + l.sets, 0);
    const minutes = session.startedAt
      ? Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))
      : 52;
    const deltaPct = Math.round(((volume - lastWorkout.volume) / lastWorkout.volume) * 100);
    return { volume, sets, minutes, deltaPct };
  }, [session]);

  const value = useMemo(
    () => ({ user: demoUser, session, startWorkout, logExercise, resetWorkout, totals }),
    [session, startWorkout, logExercise, resetWorkout, totals],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout debe usarse dentro de WorkoutProvider");
  return ctx;
}
