import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { exercises } from "@/lib/teamx-data";
import { useWorkout } from "@/lib/workout-store";

export const Route = createFileRoute("/entrenar")({
  head: () => ({
    meta: [
      { title: "Entrenando — TEAM-X" },
      { name: "description", content: "Registra peso y repeticiones ejercicio a ejercicio, sin escribir." },
      { property: "og:title", content: "Entrenando — TEAM-X" },
      { property: "og:description", content: "Modo entrenamiento paso a paso de TEAM-X." },
    ],
  }),
  component: TrainPage,
});

function TrainPage() {
  const navigate = useNavigate();
  const { session, startWorkout, logExercise } = useWorkout();
  const [logging, setLogging] = useState(false);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [notes, setNotes] = useState("");

  const index = Math.min(session.currentIndex, exercises.length - 1);
  const exercise = exercises[index] ?? exercises[0]!;

  useEffect(() => {
    if (!session.startedAt) startWorkout();
  }, [session.startedAt, startWorkout]);

  useEffect(() => {
    if (session.finished) navigate({ to: "/resumen" });
  }, [session.finished, navigate]);

  useEffect(() => {
    setWeight(exercise.targetWeight);
    setReps(exercise.reps);
    setNotes("");
    setLogging(false);
  }, [exercise]);

  return (
    <AppShell nav={false}>
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Link
          to="/home"
          aria-label="Volver al inicio"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Ejercicio {index + 1} de {exercises.length}
        </p>
      </header>

      <div className="mt-4 flex gap-1.5">
        {exercises.map((e, i) => (
          <span
            key={e.id}
            className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight">{exercise.name}</h1>

      <img
        src={exercise.image}
        alt={exercise.name}
        width={1024}
        height={640}
        className="mt-4 h-48 w-full rounded-3xl object-cover shadow-card"
      />

      {!logging ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Series × reps" value={`${exercise.sets}×${exercise.reps}`} />
            <Stat
              label="Peso objetivo"
              value={exercise.targetWeight > 0 ? `${exercise.targetWeight} kg` : "Corporal"}
            />
            <Stat label="Descanso" value={`${exercise.restSeconds}s`} />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">
            <Timer className="h-4 w-4 shrink-0" />
            Descansa {exercise.restSeconds} segundos entre series.
          </div>

          <button
            onClick={() => setLogging(true)}
            className="mt-6 flex h-16 w-full items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase tracking-wide text-primary-foreground transition active:scale-[0.98]"
          >
            Completar ejercicio
          </button>
        </>
      ) : (
        <div className="mt-5 space-y-3">
          <Stepper label="Peso" value={weight} unit="kg" step={2.5} onChange={setWeight} />
          <Stepper label="Repeticiones" value={reps} onChange={setReps} />
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <label
              htmlFor="notas"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Notas (opcional)
            </label>
            <input
              id="notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Se sintió fácil, subir peso…"
              className="mt-2 h-12 w-full rounded-xl bg-secondary px-4 text-base outline-none placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={() =>
              logExercise({
                exerciseId: exercise.id,
                weight,
                reps,
                sets: exercise.sets,
                notes,
              })
            }
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase tracking-wide text-primary-foreground transition active:scale-[0.98]"
          >
            {index === exercises.length - 1 ? "Guardar y terminar" : "Guardar y continuar"}
          </button>
          <button
            onClick={() => setLogging(false)}
            className="h-12 w-full rounded-2xl text-sm font-medium text-muted-foreground"
          >
            Volver al ejercicio
          </button>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  );
}
