import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { exercises, workoutDay } from "@/lib/teamx-data";
import { useWorkout } from "@/lib/workout-store";

export const Route = createFileRoute("/_authenticated/rutina")({
  head: () => ({
    meta: [
      { title: "Rutina Pecho + Tríceps — TEAM-X" },
      {
        name: "description",
        content: "Los 7 ejercicios de tu rutina con series, repeticiones, peso objetivo y descanso.",
      },
      { property: "og:title", content: "Rutina Pecho + Tríceps — TEAM-X" },
      { property: "og:description", content: "Series, repeticiones, peso y descanso de cada ejercicio." },
    ],
  }),
  component: RutinaPage,
});

function RutinaPage() {
  const { session } = useWorkout();
  const doneIds = new Set(session.logs.map((l) => l.exerciseId));

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-extrabold">{workoutDay.title}</h1>
      <p className="text-sm text-muted-foreground">
        {exercises.length} ejercicios · {workoutDay.estimatedMinutes} min aprox.
      </p>

      <ul className="mt-5 space-y-3">
        {exercises.map((ex, i) => (
          <li key={ex.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-stretch">
              <img
                src={ex.image}
                alt={ex.name}
                loading="lazy"
                width={1024}
                height={640}
                className="h-full w-[88px] object-cover"
              />
              <div className="min-w-0 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 font-display text-base font-bold leading-snug">
                    {i + 1}. {ex.name}
                  </p>
                  {doneIds.has(ex.id) && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ex.sets} × {ex.reps} · {ex.targetWeight > 0 ? `${ex.targetWeight} kg` : "Peso corporal"} ·{" "}
                  {ex.restSeconds}s descanso
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Link
        to="/entrenar"
        className="mt-6 flex h-16 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase text-primary-foreground"
      >
        Empezar entrenamiento
      </Link>
    </AppShell>
  );
}
