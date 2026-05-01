import { useMemo, useState } from "react";
import {
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  MoreHorizontal,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";

const inputDense =
  "h-9 w-full min-w-0 rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:border-ring";

function fmtQty(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function LegacyInvToolbar() {
  const navigate = useNavigate();
  const noop = () => {};

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="New">
        <FilePlus className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="Delete" disabled>
        <Trash2 className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden font-semibold sm:inline">Del</span>
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="Save" disabled>
        <Save className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden font-semibold sm:inline">Save</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 border-primary/60 px-3 text-sm"
        title="Execute Report / Transaction"
      >
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        <span className="ml-1.5 hidden font-semibold md:inline">Exec</span>
      </Button>
      <div className="mx-1 hidden h-7 w-px shrink-0 bg-border sm:block" aria-hidden />
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="First" onClick={noop}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="Previous" onClick={noop}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="Next" onClick={noop}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="Last" onClick={noop}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
        title="Close Active Form"
        onClick={() => navigate(-1)}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}

function LookupField({
  label,
  value,
  onChange,
  inputId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputId: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={inputId} className="text-xs">
        {label}
      </Label>
      <div className="flex gap-1.5">
        <input id={inputId} value={value} onChange={(e) => onChange(e.target.value)} className={inputDense} />
        <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Lookup" disabled>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputDense} />
    </div>
  );
}

type PrepCriteria = "brand" | "division" | "subCategory" | "item";

const PREP_CRITERIA: { id: PrepCriteria; label: string }[] = [
  { id: "brand", label: "Brand" },
  { id: "division", label: "Division" },
  { id: "subCategory", label: "Sub Category" },
  { id: "item", label: "Item" },
];

function RangeFromTo({
  label,
  fromId,
  toId,
  fromValue,
  toValue,
  onFrom,
  onTo,
}: {
  label: string;
  fromId: string;
  toId: string;
  fromValue: string;
  toValue: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/10 p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <span className="text-xs text-muted-foreground sm:py-2">From</span>
        <div className="flex gap-1.5 sm:col-span-2">
          <input
            id={fromId}
            value={fromValue}
            onChange={(e) => onFrom(e.target.value)}
            className={inputDense}
            autoComplete="off"
          />
          <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Lookup" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <span className="text-xs text-muted-foreground sm:py-2">To</span>
        <div className="flex gap-1.5 sm:col-span-2">
          <input id={toId} value={toValue} onChange={(e) => onTo(e.target.value)} className={inputDense} autoComplete="off" />
          <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Lookup" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Legacy: Stock Taking Preparation — criteria, from/to range, warehouse range, process date. */
export function StockTakingPreparationPage() {
  const noop = () => {};
  const [criteria, setCriteria] = useState<PrepCriteria>("brand");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [whFrom, setWhFrom] = useState("");
  const [whTo, setWhTo] = useState("");
  const [processDate, setProcessDate] = useState("2026-04-30");

  const rangeLabel = useMemo(() => {
    switch (criteria) {
      case "brand":
        return "Brand range";
      case "division":
        return "Division range";
      case "subCategory":
        return "Sub category range";
      case "item":
        return "Item range";
      default:
        return "Range";
    }
  }, [criteria]);

  return (
    <div className="min-w-0 space-y-3">
      <LegacyInvToolbar />
      <LegacyDivisionFormNav onPreviousForm={noop} onNextForm={noop} />

      <div className="flex min-h-[28rem] flex-col rounded-md border-2 border-border bg-card p-3 sm:min-h-[32rem] sm:p-4">
        <h2 className="mb-4 shrink-0 text-lg font-bold tracking-tight">:: Stock Taking Preparation</h2>

        <fieldset className="mb-4 space-y-2 border-0 p-0">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selection criteria
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
            {PREP_CRITERIA.map((opt) => (
              <label key={opt.id} className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="prep-criteria"
                  checked={criteria === opt.id}
                  onChange={() => setCriteria(opt.id)}
                  className="h-4 w-4 border-2 border-input accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RangeFromTo
            label={rangeLabel}
            fromId="prep-range-from"
            toId="prep-range-to"
            fromValue={rangeFrom}
            toValue={rangeTo}
            onFrom={setRangeFrom}
            onTo={setRangeTo}
          />
          <div className="space-y-2 rounded-md border border-border bg-muted/10 p-3">
            <p className="text-xs font-semibold text-muted-foreground">Warehouse</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-end">
              <span className="text-xs text-muted-foreground sm:py-2">From</span>
              <div className="flex gap-1.5 sm:col-span-2">
                <input id="prep-wh-from" value={whFrom} onChange={(e) => setWhFrom(e.target.value)} className={inputDense} />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Lookup" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-end">
              <span className="text-xs text-muted-foreground sm:py-2">To</span>
              <div className="flex gap-1.5 sm:col-span-2">
                <input id="prep-wh-to" value={whTo} onChange={(e) => setWhTo(e.target.value)} className={inputDense} />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Lookup" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 max-w-xs">
          <DateField id="prep-process-date" label="Process Date" value={processDate} onChange={setProcessDate} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Preparation filters only; Exec would generate opname worksheets in the legacy app.
      </p>
    </div>
  );
}

type StockRecordRow = {
  id: string;
  item: string;
  description: string;
  onHand: number;
  countedPieces: number;
};

/** Legacy: Stock Taking Record — filters + count entry grid. */
export function StockTakingRecordPage() {
  const noop = () => {};
  const [opnameDate, setOpnameDate] = useState("2026-04-30");
  const [warehouseCode, setWarehouseCode] = useState("");
  const [brandCode, setBrandCode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [hideZeroOnHand, setHideZeroOnHand] = useState(false);

  const [rows, setRows] = useState<StockRecordRow[]>([]);

  const updateCounted = (id: string, value: string) => {
    const n = Number.parseInt(value.replace(/\D/g, ""), 10);
    const counted = Number.isFinite(n) ? n : 0;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, countedPieces: counted } : r)));
  };

  return (
    <div className="min-w-0 space-y-3">
      <LegacyInvToolbar />
      <LegacyDivisionFormNav onPreviousForm={noop} onNextForm={noop} />

      <div className="flex min-h-[36rem] flex-col rounded-md border-2 border-border bg-card p-3 sm:min-h-[40rem] sm:p-4">
        <h2 className="mb-3 shrink-0 text-lg font-bold tracking-tight">:: Stock Taking Record</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <DateField id="str-opname" label="Stock Opname Date" value={opnameDate} onChange={setOpnameDate} />
          <LookupField label="Warehouse Code" value={warehouseCode} onChange={setWarehouseCode} inputId="str-wh" />
          <LookupField label="Brand" value={brandCode} onChange={setBrandCode} inputId="str-brand" />
          <div className="space-y-1 md:col-span-2 lg:col-span-2">
            <Label htmlFor="str-item" className="text-xs">
              Item Code
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <input id="str-item" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className={inputDense} />
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm sm:pb-2">
                <input
                  type="checkbox"
                  checked={hideZeroOnHand}
                  onChange={(e) => setHideZeroOnHand(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-input accent-primary"
                />
                Hide Zero On Hand
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Count lines</p>

          <div className="space-y-2 md:hidden">
            {rows.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                No rows (POC). Load data after filters are wired.
              </p>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="rounded-md border-2 border-border bg-muted/15 px-3 py-2.5 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">{row.item}</p>
                  <p className="font-medium">{row.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 tabular-nums text-xs sm:text-sm">
                    <span>On Hand {fmtQty(row.onHand)}</span>
                    <label className="col-span-2 flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Counted Pieces</span>
                      <input
                        className={inputDense}
                        inputMode="numeric"
                        value={String(row.countedPieces)}
                        onChange={(e) => updateCounted(row.id, e.target.value)}
                      />
                    </label>
                    <span className="col-span-2 font-semibold">Total Counted {fmtQty(row.countedPieces)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden max-h-[min(50vh,24rem)] overflow-auto rounded-md border-2 border-border bg-background md:block">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b-2 border-border bg-muted/40 hover:bg-muted/40">
                  <TableHead className="whitespace-nowrap">Item</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead className="text-right whitespace-nowrap">On Hand</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Counted Pieces</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Total Counted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No lines loaded (POC).
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono tabular-nums">{row.item}</TableCell>
                      <TableCell className="max-w-md">{row.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtQty(row.onHand)}</TableCell>
                      <TableCell className="p-1 text-right">
                        <input
                          className={cn(inputDense, "inline-block w-24 text-right tabular-nums")}
                          inputMode="numeric"
                          value={String(row.countedPieces)}
                          onChange={(e) => updateCounted(row.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtQty(row.countedPieces)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Total Counted mirrors pieces per UOM (legacy may multiply by pack size). API not wired.
      </p>
    </div>
  );
}

type PlanningRow = {
  id: string;
  itemNo: string;
  description: string;
  onHand: number;
  minLevel: number;
  suggestedQty: number;
};

/** Legacy-style replenishment planning (no reference screenshot — aligned with hub description). */
export function InventoryPlanningPage() {
  const noop = () => {};
  const [planningDate, setPlanningDate] = useState("2026-04-30");
  const [warehouseCode, setWarehouseCode] = useState("");
  const [brandFrom, setBrandFrom] = useState("");
  const [brandTo, setBrandTo] = useState("");
  const [horizonWeeks, setHorizonWeeks] = useState("4");
  const [includeNonMovers, setIncludeNonMovers] = useState(false);

  const [lines] = useState<PlanningRow[]>([]);

  return (
    <div className="min-w-0 space-y-3">
      <LegacyInvToolbar />
      <LegacyDivisionFormNav onPreviousForm={noop} onNextForm={noop} />

      <div className="flex min-h-[36rem] flex-col rounded-md border-2 border-border bg-card p-3 sm:min-h-[40rem] sm:p-4">
        <h2 className="mb-3 shrink-0 text-lg font-bold tracking-tight">:: Inventory Planning</h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <DateField id="plan-date" label="Planning Date" value={planningDate} onChange={setPlanningDate} />
          <LookupField label="Warehouse" value={warehouseCode} onChange={setWarehouseCode} inputId="plan-wh" />
          <LookupField label="Brand From" value={brandFrom} onChange={setBrandFrom} inputId="plan-bf" />
          <LookupField label="Brand To" value={brandTo} onChange={setBrandTo} inputId="plan-bt" />
          <div className="space-y-1">
            <Label htmlFor="plan-horizon" className="text-xs">
              Horizon (weeks)
            </Label>
            <input
              id="plan-horizon"
              value={horizonWeeks}
              onChange={(e) => setHorizonWeeks(e.target.value)}
              className={cn(inputDense, "max-w-[8rem] tabular-nums")}
              inputMode="numeric"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm lg:col-span-2">
            <input
              type="checkbox"
              checked={includeNonMovers}
              onChange={(e) => setIncludeNonMovers(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-input accent-primary"
            />
            Include items with no recent movement
          </label>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested orders</p>

          <div className="space-y-2 md:hidden">
            {lines.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                No suggestions (POC). Exec would populate from min/max or forecast rules.
              </p>
            ) : (
              lines.map((row) => (
                <div key={row.id} className="rounded-md border-2 border-border bg-muted/15 px-3 py-2.5 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">{row.itemNo}</p>
                  <p className="font-medium">{row.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-xs">
                    <span>On Hand {fmtQty(row.onHand)}</span>
                    <span>Min {fmtQty(row.minLevel)}</span>
                    <span className="font-semibold">Suggest {fmtQty(row.suggestedQty)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden max-h-[min(50vh,24rem)] overflow-auto rounded-md border-2 border-border bg-background md:block">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b-2 border-border bg-muted/40 hover:bg-muted/40">
                  <TableHead className="whitespace-nowrap">Item No.</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead className="text-right whitespace-nowrap">On Hand</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Min Level</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Suggested Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No planning lines (POC).
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono tabular-nums">{row.itemNo}</TableCell>
                      <TableCell className="max-w-md">{row.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtQty(row.onHand)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtQty(row.minLevel)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{fmtQty(row.suggestedQty)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Inventory Planning layout is inferred from the module purpose; adjust columns when you have a legacy
        screenshot.
      </p>
    </div>
  );
}
