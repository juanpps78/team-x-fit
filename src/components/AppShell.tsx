import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto w-full max-w-md px-5 pt-6 ${nav ? "pb-32" : "pb-8"}`}>{children}</div>
      {nav && <BottomNav />}
    </div>
  );
}
