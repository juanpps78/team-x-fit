import { Link } from "@tanstack/react-router";
import { Home, ClipboardList, Plus, TrendingUp, User } from "lucide-react";

const items = [
  { to: "/home", label: "Inicio", icon: Home },
  { to: "/rutina", label: "Rutina", icon: ClipboardList },
  { to: "/progreso", label: "Progreso", icon: TrendingUp },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.slice(0, 2).map((i) => (
          <NavItem key={i.to} {...i} />
        ))}
        <div className="flex justify-center">
          <Link
            to="/entrenar"
            aria-label="Entrenar"
            className="-mt-8 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase">Entrenar</span>
          </Link>
        </div>
        {items.slice(2).map((i) => (
          <NavItem key={i.to} {...i} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Home;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 py-1 text-muted-foreground transition-colors"
      activeProps={{ className: "!text-foreground" }}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
