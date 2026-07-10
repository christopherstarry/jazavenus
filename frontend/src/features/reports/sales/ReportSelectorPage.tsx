import { useState } from "react";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils";
import { LegacySalesReportChrome, legacyFormInputClass } from "#/features/reports/shared/legacySalesReportChrome";

const REPORT_OPTIONS = [
  { value: "", label: "â€” Select report â€”" },
  { value: "product-selling", label: "Product Selling Report" },
  { value: "sales", label: "Sales Report" },
  { value: "detail-tx", label: "Detail Transaction Report" },
] as const;

function LookupPair({
  label,
  codeId,
  code,
  onCode,
  desc,
  onDesc,
}: {
  label: string;
  codeId: string;
  code: string;
  onCode: (v: string) => void;
  desc: string;
  onDesc: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,11rem)_auto_minmax(0,1fr)] sm:items-end">
      <div className="space-y-1 sm:col-span-1">
        <Label htmlFor={codeId} className="text-xs font-medium">
          {label}
        </Label>
        <div className="flex gap-1.5">
          <input id={codeId} value={code} onChange={(e) => onCode(e.target.value)} className={legacyFormInputClass} />
          <button
            type="button"
            title="Lookup"
            disabled
            className="h-9 w-9 shrink-0 rounded-[var(--radius)] border-2 border-input bg-muted/40 text-xs font-bold text-muted-foreground"
          >
            â€¦
          </button>
        </div>
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block sm:pb-2 sm:text-center"> </span>
      <div className="space-y-1 sm:min-w-0">
        <Label htmlFor={`${codeId}-desc`} className="text-xs text-muted-foreground">
          Name / description
        </Label>
        <input
          id={`${codeId}-desc`}
          value={desc}
          onChange={(e) => onDesc(e.target.value)}
          className={legacyFormInputClass}
        />
      </div>
    </div>
  );
}

export function ReportSelectorPage() {
  const [reportKey, setReportKey] = useState<string>("");

  const [fromCust, setFromCust] = useState("");
  const [fromCustDesc, setFromCustDesc] = useState("");
  const [toCust, setToCust] = useState("");
  const [toCustDesc, setToCustDesc] = useState("");

  const [fromDoc, setFromDoc] = useState("");
  const [fromDocDesc, setFromDocDesc] = useState("");
  const [toDoc, setToDoc] = useState("");
  const [toDocDesc, setToDocDesc] = useState("");

  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-04");

  return (
    <LegacySalesReportChrome toolbarVariant="report">
      <div className="rounded-md border-2 border-border bg-[#EBE7DC] shadow-[inset_1px_1px_0_#fff] dark:bg-card">
        <div className="rounded-t-[calc(var(--radius)-2px)] bg-muted px-3 py-1.5 text-sm font-bold tracking-wide text-foreground border-b-2 border-border">
          :: Report Selector
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="max-w-3xl space-y-1">
            <Label htmlFor="report-select" className="text-xs font-medium">
              Select Report
            </Label>
            <select
              id="report-select"
              value={reportKey}
              onChange={(e) => setReportKey(e.target.value)}
              className={cn(legacyFormInputClass, "cursor-pointer bg-background")}
            >
              {REPORT_OPTIONS.map((o) => (
                <option key={o.value || "empty"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="max-w-4xl space-y-4">
            <LookupPair
              label="From Customer"
              codeId="rs-from-cust"
              code={fromCust}
              onCode={setFromCust}
              desc={fromCustDesc}
              onDesc={setFromCustDesc}
            />
            <LookupPair
              label="To Customer"
              codeId="rs-to-cust"
              code={toCust}
              onCode={setToCust}
              desc={toCustDesc}
              onDesc={setToCustDesc}
            />
            <LookupPair
              label="From Document No."
              codeId="rs-from-doc"
              code={fromDoc}
              onCode={setFromDoc}
              desc={fromDocDesc}
              onDesc={setFromDocDesc}
            />
            <LookupPair
              label="To Document No."
              codeId="rs-to-doc"
              code={toDoc}
              onCode={setToDoc}
              desc={toDocDesc}
              onDesc={setToDocDesc}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-1">
                <Label htmlFor="rs-from-date" className="text-xs font-medium">
                  From Date
                </Label>
                <input
                  id="rs-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={legacyFormInputClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rs-to-date" className="text-xs font-medium">
                  To Date
                </Label>
                <input
                  id="rs-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={legacyFormInputClass}
                />
              </div>
            </div>
          </div>

          <div className="min-h-[14rem] rounded-md border-2 border-dashed border-border/80 bg-[#E6E2D3]/80 dark:bg-muted/20" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Layout matches the legacy Report Selector; lookups and report execution are not wired yet.
      </p>
    </LegacySalesReportChrome>
  );
}
