import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { demoUser } from "@/lib/teamx-data";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — TEAM-X" },
      { name: "description", content: "Objetivo, nivel, días de entrenamiento y tiempo disponible." },
      { property: "og:title", content: "Perfil — TEAM-X" },
      { property: "og:description", content: "Tu configuración de entrenamiento en TEAM-X." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const rows = [
    { label: "Objetivo", value: demoUser.goal },
    { label: "Nivel", value: demoUser.level },
    { label: "Días de entrenamiento", value: `${demoUser.daysPerWeek} días por semana` },
    { label: "Tiempo disponible", value: `${demoUser.minutesPerSession} minutos` },
  ];

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-extrabold">Perfil</h1>

      <div className="mt-5 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-carbon font-display text-2xl font-extrabold text-primary">
          C
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold">{demoUser.name}</p>
          <p className="text-sm text-muted-foreground">
            {demoUser.totalWorkouts} entrenamientos · Racha {demoUser.streak}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li
            key={r.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-4 shadow-card"
          >
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="shrink-0 text-sm font-semibold">{r.value}</span>
          </li>
        ))}
      </ul>

      <button className="mt-6 h-14 w-full rounded-2xl bg-carbon font-display text-base font-bold uppercase tracking-wide text-carbon-foreground">
        Editar perfil
      </button>

      <Link
        to="/"
        className="mt-3 flex h-12 items-center justify-center rounded-2xl text-sm font-medium text-muted-foreground"
      >
        Cerrar sesión
      </Link>
    </AppShell>
  );
}
