import { createFileRoute } from "@tanstack/react-router";
import { RoutineBuilder } from "@/components/RoutineBuilder";

export const Route = createFileRoute("/_authenticated/rutinas/nueva")({
  head: () => ({
    meta: [
      { title: "Crear rutina — TEAM-X" },
      {
        name: "description",
        content: "Crea tu rutina: nombre, objetivo, días y ejercicios del catálogo TEAM-X.",
      },
      { property: "og:title", content: "Crear rutina — TEAM-X" },
      { property: "og:description", content: "Diseña tu rutina en minutos desde el teléfono." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <RoutineBuilder />,
});
