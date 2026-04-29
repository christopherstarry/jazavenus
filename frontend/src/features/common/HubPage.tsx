import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { type ModuleNode } from "@/app/modules";
import { useAuth, hasRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Generic landing page for a section. Shows the section's children as
 * a grid of large tiles — chunky targets for older eyes.
 *
 * Used as the default page for any module that has children but no
 * custom Component of its own (e.g. /master, /sales, /report/sales-report).
 */
export function HubPage({ node }: { node: ModuleNode }) {
  const { user } = useAuth();
  const tiles = (node.children ?? []).filter(
    (c) => !c.superAdminOnly || hasRole(user, "SuperAdmin"),
  );

  if (tiles.length === 0) {
    return (
      <div className="rounded-md border-2 border-dashed p-10 text-center">
        <p className="text-lg text-muted-foreground">No screens are available here yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {node.description && (
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
          {node.description}
        </p>
      )}

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile, idx) => {
          const showDivider = tile.divider && idx > 0;
          return (
            <div key={tile.id} className={cn(showDivider && "sm:col-span-2 lg:col-span-3 -mb-2")}>
              {showDivider && (
                <div className="hidden sm:block border-t-2 border-dashed mb-3" aria-hidden />
              )}
              <Tile tile={tile} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tile({ tile }: { tile: ModuleNode }) {
  const Icon = tile.icon;
  return (
    <Link
      to={tile.path}
      className={cn(
        "group block h-full rounded-[var(--radius)] border-2 bg-card p-5",
        "transition-colors hover:border-primary hover:bg-primary/5",
        "focus-visible:border-primary",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        )}
        <ArrowRight className="h-5 w-5 mt-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" aria-hidden />
      </div>
      <div className="mt-3 text-lg font-bold leading-tight">{tile.label}</div>
      {tile.description && (
        <div className="mt-1 text-sm sm:text-base text-muted-foreground leading-snug">
          {tile.description}
        </div>
      )}
    </Link>
  );
}
