import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { type ModuleNode } from "#/app/modules";
import { cn } from "#/lib/utils";

/**
 * Header breadcrumbs — always shows where you are with one-click jumps to any
 * ancestor. Designed for older users who like clear orientation cues.
 *
 * - The first crumb (root / Dashboard) is always a Home icon, so the user
 *   has a "get me out of here" anchor at all times.
 * - All but the last crumb are links; the last is rendered as the active
 *   page title (already shown big in the header, so it's compact here).
 * - On very small screens we hide intermediate crumbs and only show
 *   "Home › … › Current" to save space.
 */
export function Breadcrumbs({ trail, className }: { trail: ModuleNode[]; className?: string }) {
  const last = trail[trail.length - 1];
  if (!last) return null;

  const middle = trail.slice(0, -1).filter((n) => n.path !== "/");

  /* If we're already at the dashboard (root) there is nothing to breadcrumb to —
   * showing a lone home icon just looks like a stray button, so render nothing. */
  if (middle.length === 0 && last.path === "/") return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1 text-sm sm:text-base text-muted-foreground">
        <li className="shrink-0">
          <Link
            to="/"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:bg-accent"
            aria-label="Dashboard"
            title="Dashboard"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {middle.length > 0 && (
          <li aria-hidden className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </li>
        )}

        {middle.map((n) => (
          <li key={n.id} className="hidden sm:flex items-center gap-1 min-w-0">
            <Link
              to={n.path}
              className="truncate hover:text-foreground hover:underline focus-visible:outline-none focus-visible:text-foreground"
            >
              {n.label}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </li>
        ))}

        {last.path !== "/" && (
          <li className="min-w-0 truncate font-semibold text-foreground" aria-current="page">
            {last.label}
          </li>
        )}
      </ol>
    </nav>
  );
}
