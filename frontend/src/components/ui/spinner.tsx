import { cn } from "#/lib/utils";

/* Visible (24px) spinner with an accessible label. */
export function Spinner({ className, label = "Loading…" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-2", className)}>
      <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" aria-hidden>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-90" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-base text-muted-foreground">{label}</span>
    </span>
  );
}
