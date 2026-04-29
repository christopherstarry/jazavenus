import * as React from "react";
import { cn } from "@/lib/utils";

/*
  Table is the most-used widget for warehouse staff (think Excel mindset).
  - Sticky header so they don't lose context when scrolling.
  - Tall rows (h-14, ~56px) so the row that's hovered/selected is unmistakable.
  - Strong row dividers, alternating row tint, hover highlight.
  - Tabular numerals globally — money/qty columns line up.
*/

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  // overflow-x-auto only: lets WIDE tables scroll left/right inside the card,
  // while the page itself handles vertical scrolling normally. Using "auto"
  // alone (or "overflow-auto") would let CSS implicitly turn the other axis
  // into "auto" too and add a stray scrollbar.
  <div className="relative w-full overflow-x-auto overflow-y-visible rounded-[var(--radius)] border-2 border-border">
    <table className={cn("w-full caption-bottom text-base", className)} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("sticky top-0 z-10 bg-secondary [&_tr]:border-b-2", className)} {...props} />
);

export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:nth-child(even)]:bg-muted/30 [&_tr:last-child]:border-0", className)} {...props} />
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b transition-colors hover:bg-accent data-[state=selected]:bg-accent", className)} {...props} />
);

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("h-12 px-4 text-left align-middle text-sm font-bold uppercase tracking-wide text-muted-foreground", className)} {...props} />
);

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("h-14 px-4 align-middle", className)} {...props} />
);

export const TableNumeric = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("h-14 px-4 align-middle text-right font-mono", className)} {...props} />
);
