import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useWorkout } from "@/lib/workout-store";

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
  const { user } = useWorkout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const rows = [
    { label: "Objetivo", value: user.goal },
    { label: "Nivel", value: user.level },
    { label: "Días de entrenamiento", value: `${user.daysPerWeek} días por semana` },
    { label: "Tiempo disponible", value: `${user.minutesPerSession} minutos` },
  ];

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-extrabold">Perfil</h1>

      <div className="mt-5 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-carbon font-display text-2xl font-extrabold text-primary">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            {user.totalWorkouts} entrenamientos · Racha {user.streak}
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

      <button
        onClick={signOut}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-medium text-muted-foreground"
      >
        Cerrar sesión
      </button>
    </AppShell>
  );
}
