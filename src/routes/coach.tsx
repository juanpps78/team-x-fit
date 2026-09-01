import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { suggestedQuestions, workoutDay, exercises, lastWorkout } from "@/lib/teamx-data";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach TEAM-X — Asistente de entrenamiento" },
      { name: "description", content: "Pregunta por tu rutina, sustituciones de ejercicios y progreso." },
      { property: "og:title", content: "Coach TEAM-X" },
      { property: "og:description", content: "Tu asistente de entrenamiento dentro de TEAM-X." },
    ],
  }),
  component: CoachPage,
});

type Msg = { role: "user" | "coach"; text: string };

function demoAnswer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("entreno hoy") || t.includes("qué entreno"))
    return `Hoy toca ${workoutDay.title}: ${exercises.length} ejercicios, unos ${workoutDay.estimatedMinutes} minutos. Empieza con ${exercises[0].name}.`;
  if (t.includes("sustitu"))
    return "Puedes cambiar el press de banca por press en máquina o con mancuernas, manteniendo series y repeticiones.";
  if (t.includes("descans"))
    return `En tu último entrenamiento (${lastWorkout.when}) descansaste entre 60 y 90 segundos por serie, ${lastWorkout.minutes} minutos en total.`;
  if (t.includes("progreso"))
    return "Vas muy bien: +12% de volumen en las últimas semanas y racha activa. Mantén el ritmo.";
  return "Estoy en modo demo en esta primera versión. Muy pronto responderé con IA usando tus datos reales de entrenamiento.";
}

function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "coach", text: "Hola Carlos 👋 Soy tu Coach TEAM-X. ¿En qué te ayudo hoy?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "coach", text: demoAnswer(text) }]);
    setInput("");
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-extrabold">🤖 Coach TEAM-X</h1>
      <p className="text-sm text-muted-foreground">Versión demo — listo para conectar IA.</p>

      <div className="mt-5 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              m.role === "user"
                ? "ml-auto bg-carbon text-carbon-foreground"
                : "bg-card shadow-card"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          className="h-14 w-full rounded-2xl bg-card px-4 text-base shadow-card outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Enviar"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </AppShell>
  );
}
