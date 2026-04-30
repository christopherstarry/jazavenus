import type { ComponentType, ReactNode } from "react";
import { cn } from "#/lib/utils";

type IconLike = ComponentType<{ className?: string }>;

/**
 * Always tell the user what to DO next on an empty list.
 * Pattern: large icon + headline + 1-line explanation + 1 primary action.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconLike;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      <div className="rounded-full bg-secondary p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-base text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
