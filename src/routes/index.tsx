import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/welcome-hero.jpg";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TEAM-X — Tu entrenamiento. Tu progreso. Tu equipo." },
      {
        name: "description",
        content:
          "Empieza tu rutina en segundos: ejercicios, series, repeticiones y peso siempre en tu teléfono.",
      },
      { property: "og:title", content: "TEAM-X — Tu entrenamiento. Tu progreso. Tu equipo." },
      {
        property: "og:description",
        content: "La app de entrenamiento simple y rápida para el gimnasio.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <main className="relative min-h-screen bg-carbon">
      <img
        src={hero}
        alt="Dos personas entrenando en un gimnasio moderno"
        width={1024}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/70 to-carbon/20" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-end px-6 pb-10 pt-16">
        <Logo tone="light" className="text-5xl" />
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-carbon-foreground">
          Tu entrenamiento.
          <br />
          Tu progreso.
          <br />
          <span className="text-primary">Tu equipo.</span>
        </h1>
        <p className="mt-4 text-base text-carbon-foreground/70">
          Todas tus rutinas organizadas. Registra series, repeticiones y peso en segundos.
        </p>

        <Link
          to="/auth"
          className="mt-8 flex h-16 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase tracking-wide text-primary-foreground shadow-lift transition active:scale-[0.98]"
        >
          Comenzar
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/auth"
            className="flex h-12 items-center justify-center rounded-xl border border-carbon-foreground/25 text-sm font-medium text-carbon-foreground"
          >
            Ya tengo cuenta
          </Link>
          <Link
            to="/auth"
            className="flex h-12 items-center justify-center rounded-xl border border-carbon-foreground/25 text-sm font-medium text-carbon-foreground"
          >
            Crear cuenta
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-carbon-foreground/50">
          Crea tu cuenta gratis y guarda tu progreso
        </p>
      </div>
    </main>
  );
}
