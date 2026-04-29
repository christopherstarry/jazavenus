import * as React from "react";
import { cn } from "@/lib/utils";

/* 48px tall, 16px text, 2px border (visible without squinting). */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-[var(--radius)] border-2 border-input bg-background px-4 py-2 text-base",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
