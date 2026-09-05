import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exerciseImage, MUSCLE_GROUPS } from "@/lib/exercise-images";

export type CatalogExercise = {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  description: string;
  image: string;
};

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogExercise[]>([]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data } = await supabase
        .from("exercises")
        .select("id, name, muscle, equipment, description, image_key")
        .eq("is_active", true)
        .order("muscle")
        .order("name");
      if (!alive) return;
      setCatalog(
        (data ?? []).map((e) => ({
          id: e.id,
          name: e.name,
          muscle: e.muscle,
          equipment: e.equipment,
          description: e.description,
          image: exerciseImage(e.image_key),
        })),
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  return catalog;
}

export function ExercisePicker({
  onPick,
  onClose,
}: {
  onPick: (exercise: CatalogExercise) => void;
  onClose: () => void;
}) {
  const catalog = useCatalog();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter(
      (e) =>
        (!muscle || e.muscle === muscle) &&
        (!q || e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q)),
    );
  }, [catalog, query, muscle]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-5 pb-6 pt-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="font-display text-xl font-extrabold">Catálogo TEAM-X</h2>
          <button
            type="button"
            aria-label="Cerrar catálogo"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-4 shadow-card">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ejercicio…"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip label="Todos" active={muscle === null} onClick={() => setMuscle(null)} />
          {MUSCLE_GROUPS.map((m) => (
            <Chip key={m} label={m} active={muscle === m} onClick={() => setMuscle(m)} />
          ))}
        </div>

        <ul className="mt-3 flex-1 space-y-2 overflow-y-auto">
          {results.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onPick(e)}
                className="grid w-full grid-cols-[72px_minmax(0,1fr)] items-stretch overflow-hidden rounded-2xl bg-card text-left shadow-card transition active:scale-[0.99]"
              >
                <img
                  src={e.image}
                  alt={e.name}
                  loading="lazy"
                  width={1024}
                  height={576}
                  className="h-full w-[72px] object-cover"
                />
                <div className="min-w-0 p-3">
                  <p className="truncate font-display text-sm font-bold">{e.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {e.muscle} · {e.equipment}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="py-10 text-center text-sm text-muted-foreground">Sin resultados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card"
      }`}
    >
      {label}
    </button>
  );
}
