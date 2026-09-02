import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { demoUser, exercises } from "@/lib/teamx-data";
import { useWorkout } from "@/lib/workout-store";

export const Route = createFileRoute("/resumen")({
  head: () => ({
    meta: [
      { title: "Entrenamiento completado — TEAM-X" },
      { name: "description", content: "Resumen de tu sesión: tiempo, series, volumen total y racha." },
      { property: "og:title", content: "Entrenamiento completado — TEAM-X" },
      { property: "og:description", content: "Mira el volumen total y la mejora de tu sesión." },
    ],
  }),
  component: ResumenPage,
});

function ResumenPage() {
  const { totals, session, resetWorkout } = useWorkout();
  const done = session.logs.length || exercises.length;

  return (
    <AppShell nav={false}>
      <div className="rounded-3xl bg-carbon p-6 text-carbon-foreground shadow-lift">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sesión finalizada</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">¡Entrenamiento completado! 💪</h1>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Metric label="Minutos" value={`${totals.minutes}`} />
          <Metric label="Ejercicios" value={`${done}`} />
          <Metric label="Series" value={`${totals.sets}`} />
        </div>

        <div className="mt-4 rounded-2xl bg-carbon-foreground/10 p-5">
          <p className="text-xs uppercase tracking-widest text-carbon-foreground/60">Volumen total</p>
          <p className="mt-1 font-display text-4xl font-extrabold text-primary">
            {totals.volume.toLocaleString("es-ES")} kg
          </p>
          <p className="mt-1 text-sm text-carbon-foreground/70">
            {totals.deltaPct >= 0 ? "+" : ""}
            {totals.deltaPct}% de volumen respecto a tu último entrenamiento
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/20 p-4">
        <span className="text-lg">🔥</span>
        <p className="text-sm font-semibold">Racha actual: {demoUser.streak + 1} entrenamientos</p>
      </div>

      <Link
        to="/progreso"
        className="mt-6 flex h-16 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase tracking-wide text-primary-foreground"
      >
        Ver mi progreso
      </Link>
      <Link
        to="/home"
        onClick={resetWorkout}
        className="mt-3 flex h-12 items-center justify-center rounded-2xl text-sm font-medium text-muted-foreground"
      >
        Volver al inicio
      </Link>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-carbon-foreground/10 p-4">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-carbon-foreground/60">{label}</p>
    </div>
  );
}
