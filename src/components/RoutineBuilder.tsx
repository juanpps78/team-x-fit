import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ExercisePicker, type CatalogExercise } from "@/components/ExercisePicker";
import { supabase } from "@/integrations/supabase/client";
import { exerciseImage } from "@/lib/exercise-images";
import { GOALS } from "@/lib/teamx-data";
import { useWorkout } from "@/lib/workout-store";

type DraftExercise = {
  key: string;
  exerciseId: string;
  name: string;
  image: string;
  equipment: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  notes: string;
};

type DraftDay = { key: string; id?: string; title: string; exercises: DraftExercise[] };

const uid = () => Math.random().toString(36).slice(2);

const newDay = (n: number): DraftDay => ({ key: uid(), title: `Día ${n}`, exercises: [] });

export function RoutineBuilder({ planId }: { planId?: string }) {
  const navigate = useNavigate();
  const { reload } = useWorkout();
  const [step, setStep] = useState<1 | 2>(planId ? 2 : 1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const [dayCount, setDayCount] = useState(3);
  const [days, setDays] = useState<DraftDay[]>([]);
  const [picking, setPicking] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!planId);

  useEffect(() => {
    if (!planId) return;
    let alive = true;
    void (async () => {
      const { data: plan } = await supabase
        .from("workout_plans")
        .select("id, name, goal")
        .eq("id", planId)
        .maybeSingle();
      const { data: dayRows } = await supabase
        .from("workout_days")
        .select("id, title, day_order")
        .eq("plan_id", planId)
        .order("day_order");
      const { data: exRows } = await supabase
        .from("workout_exercises")
        .select(
          "id, day_id, exercise_id, sets, reps, target_weight, rest_seconds, position, notes, exercises(name, equipment, image_key)",
        )
        .in("day_id", (dayRows ?? []).map((d) => d.id))
        .order("position");
      if (!alive) return;
      if (plan) {
        setName(plan.name);
        setGoal(plan.goal);
      }
      setDays(
        (dayRows ?? []).map((d) => ({
          key: uid(),
          id: d.id,
          title: d.title,
          exercises: (exRows ?? [])
            .filter((e) => e.day_id === d.id)
            .map((e) => ({
              key: uid(),
              exerciseId: e.exercise_id,
              name: e.exercises?.name ?? "Ejercicio",
              image: exerciseImage(e.exercises?.image_key ?? "press-banca"),
              equipment: e.exercises?.equipment ?? "",
              sets: e.sets,
              reps: e.reps,
              weight: Number(e.target_weight),
              rest: e.rest_seconds,
              notes: e.notes ?? "",
            })),
        })),
      );
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [planId]);

  function goToDays() {
    if (!name.trim()) {
      setError("Ponle un nombre a tu rutina.");
      return;
    }
    setError("");
    setDays(Array.from({ length: dayCount }, (_, i) => newDay(i + 1)));
    setStep(2);
  }

  function updateDay(key: string, patch: Partial<DraftDay>) {
    setDays((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function updateExercise(dayKey: string, exKey: string, patch: Partial<DraftExercise>) {
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey
          ? { ...d, exercises: d.exercises.map((e) => (e.key === exKey ? { ...e, ...patch } : e)) }
          : d,
      ),
    );
  }

  function move(dayKey: string, index: number, dir: -1 | 1) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.key !== dayKey) return d;
        const list = [...d.exercises];
        const target = index + dir;
        if (target < 0 || target >= list.length) return d;
        const a = list[index]!;
        const b = list[target]!;
        list[index] = b;
        list[target] = a;
        return { ...d, exercises: list };
      }),
    );
  }

  function addExercise(dayKey: string, ex: CatalogExercise) {
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  key: uid(),
                  exerciseId: ex.id,
                  name: ex.name,
                  image: ex.image,
                  equipment: ex.equipment,
                  sets: 4,
                  reps: 10,
                  weight: 0,
                  rest: 60,
                  notes: "",
                },
              ],
            }
          : d,
      ),
    );
    setPicking(null);
  }

  async function save() {
    if (!name.trim()) {
      setError("Ponle un nombre a tu rutina.");
      return;
    }
    if (days.length === 0) {
      setError("Añade al menos un día.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Sesión no válida");

      let currentPlanId = planId;
      if (currentPlanId) {
        await supabase
          .from("workout_plans")
          .update({ name: name.trim(), goal })
          .eq("id", currentPlanId);
        const keptIds = days.map((d) => d.id).filter(Boolean) as string[];
        const { data: existing } = await supabase
          .from("workout_days")
          .select("id")
          .eq("plan_id", currentPlanId);
        const toDelete = (existing ?? []).map((d) => d.id).filter((id) => !keptIds.includes(id));
        if (toDelete.length) await supabase.from("workout_days").delete().in("id", toDelete);
      } else {
        const { data: created, error: planError } = await supabase
          .from("workout_plans")
          .insert({ user_id: userId, name: name.trim(), goal, is_active: false })
          .select("id")
          .single();
        if (planError || !created) throw planError ?? new Error("No se pudo crear la rutina");
        currentPlanId = created.id;
      }

      for (const [i, d] of days.entries()) {
        const minutes = Math.max(20, d.exercises.length * 8);
        let dayId = d.id;
        if (dayId) {
          await supabase
            .from("workout_days")
            .update({ title: d.title.trim() || `Día ${i + 1}`, day_order: i + 1, estimated_minutes: minutes })
            .eq("id", dayId);
          await supabase.from("workout_exercises").delete().eq("day_id", dayId);
        } else {
          const { data: createdDay, error: dayError } = await supabase
            .from("workout_days")
            .insert({
              plan_id: currentPlanId,
              user_id: userId,
              title: d.title.trim() || `Día ${i + 1}`,
              day_order: i + 1,
              estimated_minutes: minutes,
            })
            .select("id")
            .single();
          if (dayError || !createdDay) throw dayError ?? new Error("No se pudo crear el día");
          dayId = createdDay.id;
        }

        if (d.exercises.length) {
          const { error: exError } = await supabase.from("workout_exercises").insert(
            d.exercises.map((e, pos) => ({
              day_id: dayId!,
              user_id: userId,
              exercise_id: e.exerciseId,
              position: pos + 1,
              sets: e.sets,
              reps: e.reps,
              target_weight: e.weight,
              rest_seconds: e.rest,
              notes: e.notes.trim() || null,
            })),
          );
          if (exError) throw exError;
        }
      }

      await reload();
      void navigate({ to: "/rutina" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la rutina");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <AppShell>
        <p className="mt-10 text-center text-sm text-muted-foreground">Cargando rutina…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Link
          to="/rutina"
          aria-label="Volver a mis rutinas"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-extrabold">
          {planId ? "Editar rutina" : "Crear rutina"}
        </h1>
      </header>

      {step === 1 ? (
        <div className="mt-6 space-y-4">
          <Field label="Nombre de la rutina">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Piernas y glúteos"
              className="h-12 w-full rounded-xl bg-secondary px-4 text-base outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Objetivo">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    goal === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Número de días">
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDayCount(n)}
                  className={`h-12 w-12 rounded-xl font-display text-lg font-bold transition ${
                    dayCount === n ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <button
            type="button"
            onClick={goToDays}
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase text-primary-foreground transition active:scale-[0.98]"
          >
            Crear días
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Rutina
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la rutina"
              className="mt-2 h-12 w-full rounded-xl bg-secondary px-4 text-base outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    goal === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {days.map((d, di) => (
            <section key={d.key} className="rounded-2xl bg-card p-4 shadow-card">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <input
                  value={d.title}
                  onChange={(e) => updateDay(d.key, { title: e.target.value })}
                  placeholder={`Día ${di + 1}`}
                  className="h-11 w-full rounded-xl bg-secondary px-3 font-display text-base font-bold outline-none"
                />
                <button
                  type="button"
                  aria-label={`Eliminar ${d.title}`}
                  onClick={() => setDays((prev) => prev.filter((x) => x.key !== d.key))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <ul className="mt-3 space-y-3">
                {d.exercises.map((e, ei) => (
                  <li key={e.key} className="rounded-xl bg-secondary p-3">
                    <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3">
                      <img
                        src={e.image}
                        alt={e.name}
                        loading="lazy"
                        width={1024}
                        height={576}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-bold">{e.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{e.equipment}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          aria-label={`Subir ${e.name}`}
                          onClick={() => move(d.key, ei, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-card"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Bajar ${e.name}`}
                          onClick={() => move(d.key, ei, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-card"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      <NumberField
                        label="Series"
                        value={e.sets}
                        onChange={(v) => updateExercise(d.key, e.key, { sets: v })}
                      />
                      <NumberField
                        label="Reps"
                        value={e.reps}
                        onChange={(v) => updateExercise(d.key, e.key, { reps: v })}
                      />
                      <NumberField
                        label="Kg"
                        value={e.weight}
                        onChange={(v) => updateExercise(d.key, e.key, { weight: v })}
                      />
                      <NumberField
                        label="Desc. s"
                        value={e.rest}
                        onChange={(v) => updateExercise(d.key, e.key, { rest: v })}
                      />
                    </div>
                    <input
                      value={e.notes}
                      onChange={(ev) => updateExercise(d.key, e.key, { notes: ev.target.value })}
                      placeholder="Notas (opcional)"
                      className="mt-2 h-10 w-full rounded-lg bg-card px-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDays((prev) =>
                          prev.map((x) =>
                            x.key === d.key
                              ? { ...x, exercises: x.exercises.filter((y) => y.key !== e.key) }
                              : x,
                          ),
                        )
                      }
                      className="mt-2 text-xs font-semibold text-muted-foreground"
                    >
                      Quitar ejercicio
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setPicking(d.key)}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold"
              >
                <Plus className="h-4 w-4" /> Agregar ejercicio
              </button>
            </section>
          ))}

          <button
            type="button"
            onClick={() => setDays((prev) => [...prev, newDay(prev.length + 1)])}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card text-sm font-semibold shadow-card"
          >
            <Plus className="h-4 w-4" /> Agregar día
          </button>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="flex h-16 w-full items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold uppercase text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar rutina"}
          </button>
        </div>
      )}

      {picking && (
        <ExercisePicker onPick={(ex) => addExercise(picking, ex)} onClose={() => setPicking(null)} />
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 h-11 w-full rounded-lg bg-card px-2 text-center font-display text-base font-bold outline-none"
      />
    </label>
  );
}
