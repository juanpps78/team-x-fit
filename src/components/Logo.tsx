export function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight ${tone === "light" ? "text-carbon-foreground" : "text-carbon"} ${className}`}
    >
      TEAM
      <span className="mx-0.5 inline-block -skew-x-12 rounded-[0.25em] bg-primary px-[0.2em] text-carbon">
        X
      </span>
    </span>
  );
}
