import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import type { ReactNode } from "react";

/** Default rows per page — matches typical “about half a screen” of lookup rows */
export const LOOKUP_DEFAULT_PAGE_SIZE = 25;
export const LOOKUP_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * Criteria + grid + pagination: single scroll pane with an explicit height cap so scrolling always works
 * even when Tailwind/flex sizing would otherwise suppress overflow.
 */
export const LOOKUP_DIALOG_SCROLL_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden overscroll-contain min-w-0 max-h-[min(78vh,44rem)] py-1 pr-1";

/**
 * Bordered shell for the data grid + pagination strip — no inner overflow trap.
 */
export function LookupDialogResultScroll({
  className,
  scrollClassName,
  footer,
  children,
}: {
  className?: string;
  scrollClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md border-2 border-border bg-card/40",
        className,
      )}
    >
      <div className={cn("w-full", scrollClassName)}>{children}</div>
      {footer}
    </div>
  );
}

type LookupPaginationBarProps = {
  total: number;
  /** Zero-based page index */
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
};

/**
 * Footer strip under the grid: range text + page size + prev/next.
 */
export function LookupPaginationBar({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [...LOOKUP_PAGE_SIZE_OPTIONS],
  className,
}: LookupPaginationBarProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  const from = total === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(total, (safePage + 1) * pageSize);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 shrink-0 border-t-2 border-border px-3 py-2.5 bg-muted/25 text-sm",
        className,
      )}
    >
      <p className="text-muted-foreground tabular-nums">
        {total === 0 ? (
          "No rows"
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{from}</span>–
            <span className="font-medium text-foreground">{to}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-9 min-w-[4.5rem] rounded-md border-2 border-input bg-background px-2 text-base font-medium"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 min-w-[4.5rem]"
            disabled={safePage <= 0}
            onClick={() => onPageChange(safePage - 1)}
          >
            Prev
          </Button>
          <span className="min-w-[6.5rem] text-center tabular-nums text-muted-foreground text-xs sm:text-sm px-1">
            Page {safePage + 1} / {pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 min-w-[4.5rem]"
            disabled={safePage >= pageCount - 1}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Outer shell for lookup modals — flex column; middle section scrolls via {@link LOOKUP_DIALOG_SCROLL_BODY_CLASS}.
 */
export const LOOKUP_DIALOG_CONTENT_CLASS =
  "max-w-[min(100vw-1.5rem,46rem)] p-4 sm:p-5 gap-0 border-2 max-h-[min(94vh,52rem)] flex min-h-0 flex-col overflow-hidden [&>button]:top-3 [&>button]:right-3";
