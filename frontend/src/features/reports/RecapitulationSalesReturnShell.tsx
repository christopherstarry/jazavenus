import { type ReactNode, useId, useState } from "react";
import { Label } from "#/components/ui/label";
import { legacyFormInputClass } from "#/features/reports/legacySalesReportChrome";
import { LegacyReportBeigePanel } from "#/features/reports/LegacyReportBeigePanel";

export function RecapitulationSalesReturnShell({
  filterSlot,
}: {
  /** Rows above the date range (brand / customer / salesman / status fields). */
  filterSlot: ReactNode;
}) {
  const uid = useId();

  const [fromDocDate, setFromDocDate] = useState("2026-05-01");
  const [toDocDate, setToDocDate] = useState("2026-05-04");

  return (
    <LegacyReportBeigePanel
      title="Recapitulation Sales and Return"
      footerNote="POC: filters only; Execute report is not wired yet."
    >
      {filterSlot}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`rsr-from-${uid}`} className="text-xs font-medium">
            From Doc Date
          </Label>
          <input
            id={`rsr-from-${uid}`}
            type="date"
            value={fromDocDate}
            onChange={(e) => setFromDocDate(e.target.value)}
            className={legacyFormInputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`rsr-to-${uid}`} className="text-xs font-medium">
            To
          </Label>
          <input
            id={`rsr-to-${uid}`}
            type="date"
            value={toDocDate}
            onChange={(e) => setToDocDate(e.target.value)}
            className={legacyFormInputClass}
          />
        </div>
      </div>

      <div
        className="min-h-[min(45vh,24rem)] rounded-md border-2 border-[#C9C5BA] bg-[#E8E4D9] dark:border-border dark:bg-muted/15"
        aria-label="Report workspace"
      />
    </LegacyReportBeigePanel>
  );
}
