import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { useWorkout } from "@/lib/workout-store";

export const Route = createFileRoute("/_authenticated/progreso")({
  head: () => ({
    meta: [
      { title: "Mi progreso — TEAM-X" },
      {
        name: "description",
        content: "Entrenamientos, racha, evolución del volumen y tus mejores marcas.",
      },
      { property: "og:title", content: "Mi progreso — TEAM-X" },
      { property: "og:description", content: "Sigue tu evolución semana a semana con TEAM-X." },
    ],
  }),
  component: ProgresoPage,
});

function ProgresoPage() {
  const { user, history, records, progressDeltaPct } = useWorkout();
  const volumeHistory = history;
  const personalRecords = records;
  return (
    <AppShell>
      <h1 className="font-display text-2xl font-extrabold">Mi progreso</h1>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Kpi label="Entrenos" value={`${user.totalWorkouts}`} />
        <Kpi label="Racha" value={`${user.streak} días`} />
        <Kpi label="Volumen" value={`${progressDeltaPct >= 0 ? "+" : ""}${progressDeltaPct}%`} highlight />
      </div>

      <section className="mt-5 rounded-3xl bg-card p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Evolución del volumen
        </p>
        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="99%" height="100%" debounce={50}>
            <AreaChart data={volumeHistory} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.75} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v.toLocaleString("es-ES")} kg`, "Volumen"]}
              />
              <Area
                type="monotone"
                dataKey="volumen"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fill="url(#vol)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Mejores marcas
        </p>
        <ul className="mt-3 space-y-3">
          {personalRecords.map((r) => (
            <li
              key={r.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-4 shadow-card"
            >
              <span className="truncate font-medium">{r.name}</span>
              <span className="shrink-0 font-display text-lg font-bold">{r.value} kg</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function Kpi({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 shadow-card ${highlight ? "bg-primary" : "bg-card"}`}>
      <p className="font-display text-xl font-extrabold">{value}</p>
      <p className={`text-[11px] uppercase tracking-widest ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
    </div>
  );
}
