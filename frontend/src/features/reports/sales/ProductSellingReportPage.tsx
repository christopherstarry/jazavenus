import { useCallback, useId, useState } from "react";
import { Label } from "#/components/ui/label";
import {
  CodeBrowseRow,
  LegacySalesReportChrome,
  legacyFormInputClass,
} from "#/features/reports/shared/legacySalesReportChrome";

const AXES = [
  { id: "faktur", checkboxLabel: "Faktur", rowLabel: "Doc No" },
  { id: "product", checkboxLabel: "Product", rowLabel: "Product Code" },
  { id: "brand", checkboxLabel: "Brand", rowLabel: "Brand Code" },
  { id: "principle", checkboxLabel: "Principle", rowLabel: "Principle Code" },
  { id: "customer", checkboxLabel: "Customer", rowLabel: "Customer Code" },
  { id: "salesman", checkboxLabel: "Salesman", rowLabel: "Salesman Code" },
  { id: "division", checkboxLabel: "Division", rowLabel: "Division Code" },
  { id: "periode", checkboxLabel: "Periode", rowLabel: "Periode Code" },
] as const;

type AxisId = (typeof AXES)[number]["id"];

type AxisValues = Record<AxisId, { code: string; desc: string; all: boolean }>;

function emptyAxisValues(): AxisValues {
  return {
    faktur: { code: "", desc: "", all: false },
    product: { code: "", desc: "", all: false },
    brand: { code: "", desc: "", all: false },
    principle: { code: "", desc: "", all: false },
    customer: { code: "", desc: "", all: false },
    salesman: { code: "", desc: "", all: false },
    division: { code: "", desc: "", all: false },
    periode: { code: "", desc: "", all: false },
  };
}

/** Product Selling Report â€” toggled breakdown axes show code rows + browse + All. */
export function ProductSellingReportPage() {
  const uid = useId();
  const noop = () => {};

  const [enabled, setEnabled] = useState<Record<AxisId, boolean>>({
    faktur: false,
    product: false,
    brand: false,
    principle: false,
    customer: false,
    salesman: false,
    division: false,
    periode: false,
  });

  const [axisValues, setAxisValues] = useState<AxisValues>(() => emptyAxisValues());

  const setAxis = useCallback((id: AxisId, patch: Partial<AxisValues[AxisId]>) => {
    setAxisValues((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const [fromDocDate, setFromDocDate] = useState("2026-05-01");
  const [toDocDate, setToDocDate] = useState("2026-05-04");

  return (
    <LegacySalesReportChrome toolbarVariant="transaction" onPreviousForm={noop} onNextForm={noop}>
      <div className="rounded-md border-2 border-border bg-[#EBE7DC] shadow-[inset_1px_1px_0_#fff] dark:bg-card">
        <div className="rounded-t-[calc(var(--radius)-2px)] border-b-2 border-border bg-muted px-3 py-1.5 text-sm font-bold tracking-wide text-foreground">
          :: Product Selling Report
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <fieldset className="rounded-md border-2 border-border bg-background/60 px-3 py-3 dark:bg-background/40">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">Breakdown</legend>
            <p className="mb-3 text-xs text-muted-foreground">
              Tick the axes to filter by; each enabled axis shows a code field below.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {AXES.map(({ id, checkboxLabel }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                >
                  <input
                    type="checkbox"
                    checked={enabled[id]}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setEnabled((prev) => ({ ...prev, [id]: on }));
                      if (!on) {
                        setAxis(id, { code: "", desc: "", all: false });
                      }
                    }}
                    className="h-4 w-4 rounded border-2 border-input accent-primary"
                  />
                  {checkboxLabel}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-4">
            {AXES.map(({ id, rowLabel }) =>
              enabled[id] ? (
                <CodeBrowseRow
                  key={id}
                  label={rowLabel}
                  inputId={`psr-${id}-${uid}`}
                  value={axisValues[id].code}
                  onChange={(code) => setAxis(id, { code })}
                  description={axisValues[id].desc}
                  onDescriptionChange={(desc) => setAxis(id, { desc })}
                  allChecked={axisValues[id].all}
                  onAllChange={(all) => setAxis(id, { all })}
                  showAll
                />
              ) : null,
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`psr-from-${uid}`} className="text-xs font-medium">
                From Doc Date
              </Label>
              <input
                id={`psr-from-${uid}`}
                type="date"
                value={fromDocDate}
                onChange={(e) => setFromDocDate(e.target.value)}
                className={legacyFormInputClass}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`psr-to-${uid}`} className="text-xs font-medium">
                To
              </Label>
              <input
                id={`psr-to-${uid}`}
                type="date"
                value={toDocDate}
                onChange={(e) => setToDocDate(e.target.value)}
                className={legacyFormInputClass}
              />
            </div>
          </div>

          <div
            className="min-h-[min(50vh,28rem)] rounded-md border-2 border-[#C9C5BA] bg-[#E8E4D9] dark:border-border dark:bg-muted/15"
            aria-label="Report workspace"
          />
        </div>

        <p className="border-t-2 border-border px-4 py-2 text-xs text-muted-foreground sm:px-5">
          POC: dynamic breakdown checkboxes; Execute report is not wired yet.
        </p>
      </div>
    </LegacySalesReportChrome>
  );
}
