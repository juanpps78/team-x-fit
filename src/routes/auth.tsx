import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar o crear cuenta — TEAM-X" },
      { name: "description", content: "Accede a tus rutinas y tu progreso de entrenamiento en TEAM-X." },
      { property: "og:title", content: "Entrar o crear cuenta — TEAM-X" },
      { property: "og:description", content: "Tu rutina y tu progreso, siempre contigo." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || "Atleta" },
            emailRedirectTo: `${window.location.origin}/home`,
          },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/home", replace: true });
      else setError("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos completar la operación.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-carbon px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <Logo tone="light" className="text-4xl" />
        <h1 className="mt-4 font-display text-3xl font-bold text-carbon-foreground">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="mt-2 text-sm text-carbon-foreground/70">
          Tu rutina y tu progreso, guardados de forma segura.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          {mode === "signup" && (
            <Field label="Nombre" value={name} onChange={setName} type="text" placeholder="Carlos" />
          )}
          <Field
            label="Correo"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="tu@correo.com"
          />
          <Field
            label="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Mínimo 6 caracteres"
          />

          {error && (
            <p className="rounded-xl bg-carbon-foreground/10 p-3 text-sm text-carbon-foreground">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="mt-4 h-12 w-full rounded-2xl text-sm font-medium text-carbon-foreground/70"
        >
          {mode === "login" ? "No tengo cuenta — Crear cuenta" : "Ya tengo cuenta — Iniciar sesión"}
        </button>

        <Link
          to="/"
          className="mt-2 flex h-12 items-center justify-center text-xs text-carbon-foreground/50"
        >
          Volver
        </Link>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-carbon-foreground/60">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-14 w-full rounded-2xl bg-carbon-foreground/10 px-4 text-base text-carbon-foreground outline-none placeholder:text-carbon-foreground/40"
      />
    </label>
  );
}
