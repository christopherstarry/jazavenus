import { Fragment } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { type ModuleNode } from "@/app/modules";
import { useAuth, hasRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Generic landing page for a section. Shows the section's children as
 * a compact grid — sized so an 8-tile section like Master Maintenance
 * fits in one screen on a normal desktop without scrolling.
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
    <div className="space-y-3 sm:space-y-4">
      {node.description && (
        <p className="text-base text-muted-foreground max-w-3xl">
          {node.description}
        </p>
      )}

      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tiles.map((tile, idx) => {
          const showDivider = tile.divider && idx > 0;
          return (
            <Fragment key={tile.id}>
              {showDivider && (
                /* Divider is its own grid item spanning every column.
                   This avoids the previous bug where the tile after a
                   divider was forced to col-span-full and ballooned. */
                <div
                  className="col-span-full hidden sm:block border-t border-dashed border-border my-1"
                  aria-hidden
                />
              )}
              <Tile tile={tile} />
            </Fragment>
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
        "group flex items-start gap-3 rounded-[var(--radius)] border-2 bg-card",
        "px-4 py-3 sm:px-4 sm:py-3",
        "transition-colors hover:border-primary hover:bg-primary/5",
        "focus-visible:border-primary",
      )}
    >
      {Icon && (
        <div
          className={cn(
            "shrink-0 rounded-md bg-primary/10 p-2 text-primary",
            "group-hover:bg-primary group-hover:text-primary-foreground transition-colors",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-base font-bold leading-tight">{tile.label}</div>
        {tile.description && (
          <div className="mt-0.5 text-sm text-muted-foreground leading-snug line-clamp-2">
            {tile.description}
          </div>
        )}
      </div>
      <ArrowRight
        className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
        aria-hidden
      />
    </Link>
  );
}
