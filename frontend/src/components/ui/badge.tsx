import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Status badges that use BOTH colour and a small icon dot — colourblind-safe. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border-2",
  {
    variants: {
      tone: {
        neutral:     "bg-secondary text-secondary-foreground border-border",
        info:        "bg-primary/10 text-primary border-primary/30",
        success:     "bg-success/10 text-success border-success/40",
        warning:     "bg-warning/10 text-warning border-warning/40",
        destructive: "bg-destructive/10 text-destructive border-destructive/40",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, className }))} {...props}>
      <span className="size-2 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}
