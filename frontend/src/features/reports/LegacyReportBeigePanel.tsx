import type { ReactNode } from "react";

/** Grey header + beige body used across legacy-style report forms. */
export function LegacyReportBeigePanel({
  title,
  children,
  footerNote,
}: {
  title: string;
  children: ReactNode;
  footerNote?: string;
}) {
  return (
    <div className="rounded-md border-2 border-border bg-[#EBE7DC] shadow-[inset_1px_1px_0_#fff] dark:bg-card">
      <div className="rounded-t-[calc(var(--radius)-2px)] border-b-2 border-border bg-muted px-3 py-1.5 text-sm font-bold tracking-wide text-foreground">
        {title.startsWith("::") ? title : `:: ${title}`}
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
      {footerNote ? (
        <p className="border-t-2 border-border px-4 py-2 text-xs text-muted-foreground sm:px-5">{footerNote}</p>
      ) : null}
    </div>
  );
}
