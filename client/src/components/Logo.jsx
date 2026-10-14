import { cn } from "@/lib/utils";

export default function Logo({ size = 40, dark = false, text = false, className }) {
  const c = dark ? "#6b6f42" : "#fffdea";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 16 C8 8 16 6 26 8 L36 10" />
        <path d="M14 20 L34 24 C40 25 42 30 38 35 C34 41 24 42 16 38 C8 34 8 26 14 20 Z" />
        <path d="M26 14 L20 32" />
      </svg>
      {text && (
        <span className="text-3xl font-bold tracking-wide text-sidebar-foreground">
          Cuccu<span className="text-sidebar-deep">POS</span>
        </span>
      )}
    </div>
  );
}
