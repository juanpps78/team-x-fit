import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Dumbbell, Flame } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { exercises, lastWorkout, workoutDay } from "@/lib/teamx-data";
import { useWorkout } from "@/lib/workout-store";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Inicio — TEAM-X" },
      { name: "description", content: "Tu entrenamiento de hoy, tu racha y tu último registro." },
      { property: "og:title", content: "Inicio — TEAM-X" },
      { property: "og:description", content: "Empieza el entrenamiento de hoy en un toque." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, session } = useWorkout();
  const done = session.logs.length;
  const pct = Math.round((done / exercises.length) * 100);

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold">Hola, {user.name} 👋</p>
          <p className="text-sm text-muted-foreground">¿Listo para entrenar?</p>
        </div>
        <Logo className="shrink-0 text-lg" />
      </header>

      <section className="mt-6 rounded-3xl bg-carbon p-6 shadow-lift">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Entrenamiento de hoy
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-carbon-foreground">
          {workoutDay.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-carbon-foreground/70">
          <span className="flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4" /> {exercises.length} ejercicios
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {workoutDay.estimatedMinutes} min aprox.
          </span>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-carbon-foreground/70">
            <span>Progreso</span>
            <span>
              {done} / {exercises.length} ejercicios
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-carbon-foreground/15">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Link
          to="/entrenar"
          className="mt-6 flex h-16 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase tracking-wide text-primary-foreground transition active:scale-[0.98]"
        >
          {done > 0 && done < exercises.length ? "Continuar entrenamiento" : "Empezar entrenamiento"}
        </Link>
      </section>

      <section className="mt-5 rounded-2xl bg-card p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Último entrenamiento
        </p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">{lastWorkout.title}</p>
            <p className="text-sm text-muted-foreground">{lastWorkout.when}</p>
          </div>
          <p className="shrink-0 font-display text-lg font-bold">{lastWorkout.minutes} min</p>
        </div>
      </section>

      <section className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/20 p-4">
        <Flame className="h-6 w-6 shrink-0 text-foreground" />
        <p className="text-sm font-semibold">Racha: {user.streak} entrenamientos</p>
      </section>

      <Link
        to="/coach"
        className="mt-4 flex items-center justify-between rounded-2xl bg-card p-4 shadow-card"
      >
        <span className="text-sm font-semibold">🤖 Coach TEAM-X</span>
        <span className="text-sm text-muted-foreground">Preguntar →</span>
      </Link>
    </AppShell>
  );
}
