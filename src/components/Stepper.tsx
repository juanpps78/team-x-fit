import { Minus, Plus } from "lucide-react";

export function Stepper({
  label,
  value,
  unit,
  step = 1,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button
          type="button"
          aria-label={`Reducir ${label}`}
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition active:scale-95"
        >
          <Minus className="h-6 w-6" strokeWidth={3} />
        </button>
        <p className="text-center font-display text-3xl font-extrabold tabular-nums">
          {value}
          {unit ? <span className="ml-1 text-lg text-muted-foreground">{unit}</span> : null}
        </p>
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          onClick={() => onChange(+(value + step).toFixed(1))}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition active:scale-95"
        >
          <Plus className="h-6 w-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
