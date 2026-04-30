import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

/* For documenting keyboard shortcuts: <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      "inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-md border-2 border-border bg-secondary text-secondary-foreground text-sm font-mono font-semibold shadow-[inset_0_-2px_0_rgba(0,0,0,0.06)]",
      className
    )}>
      {children}
    </kbd>
  );
}
