import { useId, useState } from "react";
import { Label } from "#/components/ui/label";
import {
  CodeBrowseRow,
  LegacySalesReportChrome,
  legacyFormInputClass,
} from "#/features/reports/shared/legacySalesReportChrome";
import { LegacyReportBeigePanel } from "#/features/reports/shared/LegacyReportBeigePanel";

/** Legacy: Laporan Detail Transaksi Penjualan â€” filters only (Brand, Doc Date range, RawData). */
export function DetailTransactionPenjualanReportPage() {
  const uid = useId();

  const [brand, setBrand] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [brandAll, setBrandAll] = useState(false);

  const [fromDocDate, setFromDocDate] = useState("2026-05-01");
  const [toDocDate, setToDocDate] = useState("2026-05-04");

  const [rawData, setRawData] = useState(false);

  const noop = () => {};

  return (
    <LegacySalesReportChrome toolbarVariant="transaction" onPreviousForm={noop} onNextForm={noop}>
      <LegacyReportBeigePanel
        title="Laporan Detail Transaksi Penjualan"
        footerNote="POC: Execute report is not wired yet."
      >
        <CodeBrowseRow
          label="Brand Code"
          inputId={`ldtp-brand-${uid}`}
          value={brand}
          onChange={setBrand}
          description={brandDesc}
          onDescriptionChange={setBrandDesc}
          allChecked={brandAll}
          onAllChange={setBrandAll}
          showAll
        />

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-1">
            <Label htmlFor={`ldtp-from-${uid}`} className="text-xs font-medium">
              Doc Date
            </Label>
            <input
              id={`ldtp-from-${uid}`}
              type="date"
              value={fromDocDate}
              onChange={(e) => setFromDocDate(e.target.value)}
              className={legacyFormInputClass}
            />
          </div>
          <span className="hidden pb-2 text-center text-sm font-medium text-muted-foreground sm:block">To</span>
          <div className="space-y-1">
            <Label htmlFor={`ldtp-to-${uid}`} className="text-xs font-medium sm:sr-only">
              To Doc Date
            </Label>
            <input
              id={`ldtp-to-${uid}`}
              type="date"
              value={toDocDate}
              onChange={(e) => setToDocDate(e.target.value)}
              className={legacyFormInputClass}
            />
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={rawData}
            onChange={(e) => setRawData(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-input accent-primary"
          />
          RawData
        </label>

        <div
          className="min-h-[min(40vh,20rem)] rounded-md border-2 border-[#C9C5BA] bg-[#E8E4D9] dark:border-border dark:bg-muted/15"
          aria-hidden
        />
      </LegacyReportBeigePanel>
    </LegacySalesReportChrome>
  );
}
