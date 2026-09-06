import { createFileRoute, useParams } from "@tanstack/react-router";
import { RoutineBuilder } from "@/components/RoutineBuilder";

export const Route = createFileRoute("/_authenticated/rutinas/$planId")({
  head: () => ({
    meta: [
      { title: "Editar rutina — TEAM-X" },
      {
        name: "description",
        content: "Edita los días, ejercicios, series, repeticiones y descansos de tu rutina.",
      },
      { property: "og:title", content: "Editar rutina — TEAM-X" },
      { property: "og:description", content: "Ajusta tu rutina cuando quieras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditRoutinePage,
});

function EditRoutinePage() {
  const { planId } = useParams({ from: "/_authenticated/rutinas/$planId" });
  return <RoutineBuilder planId={planId} />;
}
