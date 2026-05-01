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
  Undo2,
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

export type SalesFormVariant = "sales-order" | "sales-confirmation" | "sales-return" | "invoicing";

type SalesLineItem = {
  id: string;
  itemNo: string;
  description: string;
  quantity: number;
  salePrice: number;
  disc1: number;
  disc2: number;
  bonus: number;
  buyPrice: number;
  uom?: string;
};

type DetailFooterTab = "detail-order" | "customer-detail";
type TotalsFooterTab = "general" | "discount";

function fmtMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function configFor(v: SalesFormVariant) {
  switch (v) {
    case "sales-order":
      return {
        title: ":: Sales Order",
        secondDateLabel: "Delivery Date",
        totalColumnHeader: "Total (Rp)",
        headerFlag: { label: "Open Discount For Entry", id: "sales-open-disc" } as const,
        discLabels: ["Disc 1", "Disc 2"] as const,
        showUom: false,
        warehouseFirst: false,
        footerActionLabel: "Order" as const,
        showConfirmationNo: false,
      };
    case "sales-confirmation":
      return {
        title: ":: Sales Confirmation",
        secondDateLabel: "Value Date",
        totalColumnHeader: "Total (LC)",
        headerFlag: null,
        discLabels: ["Disc 1", "Disc 2"] as const,
        showUom: false,
        warehouseFirst: false,
        footerActionLabel: "Order" as const,
        showConfirmationNo: false,
      };
    case "sales-return":
      return {
        title: ":: Sales Return",
        secondDateLabel: "Value Date",
        totalColumnHeader: "Total (LC)",
        headerFlag: { label: "Using OLD Price", id: "sales-old-price" } as const,
        discLabels: ["Disc P1", "Disc P2"] as const,
        showUom: true,
        warehouseFirst: true,
        footerActionLabel: "Confirmation" as const,
        showConfirmationNo: false,
      };
    case "invoicing":
      return {
        title: ":: Invoicing Process",
        secondDateLabel: "Value Date",
        totalColumnHeader: "Total (LC)",
        headerFlag: null,
        discLabels: ["Disc 1", "Disc 2"] as const,
        showUom: false,
        warehouseFirst: false,
        footerActionLabel: "Confirmation" as const,
        showConfirmationNo: true,
      };
    default:
      return configFor("sales-order");
  }
}

function SalesTransactionForm({ variant }: { variant: SalesFormVariant }) {
  const navigate = useNavigate();
  const cfg = configFor(variant);

  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState("0");

  const [headerCheckbox, setHeaderCheckbox] = useState(false);

  const [manualNo, setManualNo] = useState(false);
  const [docNo, setDocNo] = useState("");
  const [postingDate, setPostingDate] = useState("2026-04-30");
  const [secondDate, setSecondDate] = useState("2026-04-30");
  const [shipToCode, setShipToCode] = useState("");
  const [warehouseCode, setWarehouseCode] = useState("001");

  const [lines] = useState<SalesLineItem[]>([]);

  const [detailTab, setDetailTab] = useState<DetailFooterTab>("detail-order");
  const [totalsTab, setTotalsTab] = useState<TotalsFooterTab>("general");

  const [salesEmployee, setSalesEmployee] = useState("DEDI (081224681302)");
  const [paymentTerms, setPaymentTerms] = useState("14");
  const [remarks, setRemarks] = useState("");
  const [confirmationNo, setConfirmationNo] = useState("");

  const [extraDiscEnabled, setExtraDiscEnabled] = useState(false);
  const [extraDiscPercent, setExtraDiscPercent] = useState("0");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxPercent, setTaxPercent] = useState("11");

  const totalBeforeDiscount = useMemo(
    () => lines.reduce((s, r) => s + r.quantity * r.salePrice, 0),
    [lines],
  );

  const extraDiscAmount = useMemo(() => {
    if (!extraDiscEnabled) return 0;
    const p = Number.parseFloat(extraDiscPercent.replace(/,/g, "."));
    if (!Number.isFinite(p) || p <= 0) return 0;
    return Math.round((totalBeforeDiscount * p) / 100);
  }, [extraDiscEnabled, extraDiscPercent, totalBeforeDiscount]);

  const totalAfterDiscount = totalBeforeDiscount - extraDiscAmount;

  const taxAmount = useMemo(() => {
    if (!taxEnabled) return 0;
    const p = Number.parseFloat(taxPercent.replace(/,/g, "."));
    if (!Number.isFinite(p) || p <= 0) return 0;
    return Math.round((totalAfterDiscount * p) / 100);
  }, [taxEnabled, taxPercent, totalAfterDiscount]);

  const grandTotal = totalAfterDiscount + taxAmount;

  const noop = () => {};

  const warehouseBlock = (
    <LookupField
      label="Warehouse Code"
      value={warehouseCode}
      onChange={setWarehouseCode}
      inputId={`${variant}-whs`}
    />
  );
  const shipBlock = (
    <LookupField label="Ship To Code" value={shipToCode} onChange={setShipToCode} inputId={`${variant}-ship`} />
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="New">
          <FilePlus className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="Undo"
          disabled
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">Undo</span>
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

      <LegacyDivisionFormNav onPreviousForm={noop} onNextForm={noop} />

      <div className="flex min-h-[36rem] flex-col rounded-md border-2 border-border bg-card p-3 sm:min-h-[42rem] sm:p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="shrink-0 text-lg font-bold tracking-tight">{cfg.title}</h2>
          {cfg.headerFlag ? (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                id={cfg.headerFlag.id}
                type="checkbox"
                checked={headerCheckbox}
                onChange={(e) => setHeaderCheckbox(e.target.checked)}
                className="h-4 w-4 rounded border-2 border-input accent-primary"
              />
              {cfg.headerFlag.label}
            </label>
          ) : (
            <span className="hidden sm:block" aria-hidden />
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-3">
            <LookupField
              label="Customer"
              value={customerCode}
              onChange={setCustomerCode}
              inputId={`${variant}-cust`}
            />
            <div className="space-y-1">
              <Label htmlFor={`${variant}-cust-name`} className="text-xs">
                Name
              </Label>
              <input
                id={`${variant}-cust-name`}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputDense}
              />
            </div>
            <LookupField
              label="Contact Person"
              value={contactPerson}
              onChange={setContactPerson}
              inputId={`${variant}-contact`}
            />
            <div className="space-y-1">
              <Label htmlFor={`${variant}-addr`} className="text-xs">
                Address
              </Label>
              <textarea
                id={`${variant}-addr`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={cn(inputDense, "min-h-[4.5rem] py-2")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${variant}-credit`} className="text-xs">
                Credit Limit
              </Label>
              <input
                id={`${variant}-credit`}
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className={cn(inputDense, "tabular-nums")}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">No.</span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                  className={cn(inputDense, "max-w-[12rem] flex-1 font-mono tabular-nums")}
                  autoComplete="off"
                />
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={manualNo}
                    onChange={(e) => setManualNo(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-input accent-primary"
                  />
                  Manual
                </label>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Lookup" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DateField id={`${variant}-post`} label="Posting Date" value={postingDate} onChange={setPostingDate} />
            <DateField
              id={`${variant}-second`}
              label={cfg.secondDateLabel}
              value={secondDate}
              onChange={setSecondDate}
            />
            {cfg.warehouseFirst ? (
              <>
                {warehouseBlock}
                {shipBlock}
              </>
            ) : (
              <>
                {shipBlock}
                {warehouseBlock}
              </>
            )}
          </div>
        </div>

        {/* Line grid */}
        <div className="mt-4 min-h-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line items</p>

          <div className="max-h-[min(48vh,24rem)] overflow-auto rounded-md border-2 border-border bg-background">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b-2 border-border bg-muted/40 hover:bg-muted/40">
                  <TableHead className="whitespace-nowrap">Item No.</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Qty</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Sale Price</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{cfg.totalColumnHeader}</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{cfg.discLabels[0]}</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{cfg.discLabels[1]}</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Bonus</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Buy Price</TableHead>
                  {cfg.showUom ? <TableHead className="whitespace-nowrap">UOM</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={cfg.showUom ? 10 : 9}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono tabular-nums">{row.itemNo}</TableCell>
                      <TableCell className="max-w-xs">{row.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtMoney(row.salePrice)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtMoney(row.quantity * row.salePrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.disc1}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.disc2}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.bonus}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtMoney(row.buyPrice)}</TableCell>
                      {cfg.showUom ? <TableCell>{row.uom ?? "—"}</TableCell> : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer: detail tabs + totals tabs */}
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 border-t-2 border-border pt-3 lg:grid-cols-2 lg:gap-6">
          <div className="flex min-h-0 flex-col gap-2">
            <div
              role="tablist"
              aria-label="Detail sections"
              className="flex flex-wrap gap-2 border-b border-border pb-2"
            >
              {(
                [
                  ["detail-order", "Detail Order"],
                  ["customer-detail", "Customer Detail"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={detailTab === id}
                  onClick={() => setDetailTab(id)}
                  className={cn(
                    "rounded-md border-2 px-3 py-1.5 text-xs font-semibold sm:text-sm",
                    detailTab === id
                      ? "border-primary bg-muted/50 text-primary"
                      : "border-border bg-transparent text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              hidden={detailTab !== "detail-order"}
              className="min-h-0 flex-1 space-y-3"
            >
              <LookupField
                label="Sales Employee"
                value={salesEmployee}
                onChange={setSalesEmployee}
                inputId={`${variant}-emp`}
              />
              <LookupField
                label="Payment Terms"
                value={paymentTerms}
                onChange={setPaymentTerms}
                inputId={`${variant}-payterms`}
              />
              <div className="space-y-1">
                <Label htmlFor={`${variant}-remarks`} className="text-xs">
                  Remarks
                </Label>
                <textarea
                  id={`${variant}-remarks`}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className={cn(inputDense, "min-h-[5rem] py-2")}
                />
              </div>
              {cfg.showConfirmationNo ? (
                <div className="space-y-1">
                  <Label htmlFor={`${variant}-conf-no`} className="text-xs">
                    Confirmation Number
                  </Label>
                  <input
                    id={`${variant}-conf-no`}
                    value={confirmationNo}
                    onChange={(e) => setConfirmationNo(e.target.value)}
                    className={inputDense}
                  />
                </div>
              ) : null}
              <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled>
                {cfg.footerActionLabel}
              </Button>
            </div>
            <div
              role="tabpanel"
              hidden={detailTab !== "customer-detail"}
              className="space-y-2 text-sm text-muted-foreground"
            >
              <p>POC: Extra customer fields (tax ID, territory, …) wire here when needed.</p>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2 lg:border-l lg:border-border lg:pl-6">
            <div
              role="tablist"
              aria-label="Totals sections"
              className="flex flex-wrap gap-2 border-b border-border pb-2"
            >
              {(
                [
                  ["general", "General"],
                  ["discount", "Discount"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={totalsTab === id}
                  onClick={() => setTotalsTab(id)}
                  className={cn(
                    "rounded-md border-2 px-3 py-1.5 text-xs font-semibold sm:text-sm",
                    totalsTab === id
                      ? "border-primary bg-muted/50 text-primary"
                      : "border-border bg-transparent text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div role="tabpanel" hidden={totalsTab !== "general"} className="space-y-3 rounded-md border border-border bg-muted/15 p-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">Total Before Discount</span>
                <span className="tabular-nums font-semibold">{fmtMoney(totalBeforeDiscount)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">Total After Discount</span>
                <span className="tabular-nums font-semibold">{fmtMoney(totalAfterDiscount)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={extraDiscEnabled}
                    onChange={(e) => setExtraDiscEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-input accent-primary"
                  />
                  Extra Disc
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={extraDiscPercent}
                    onChange={(e) => setExtraDiscPercent(e.target.value)}
                    className={cn(inputDense, "w-14 text-right tabular-nums")}
                    inputMode="decimal"
                  />
                  <span className="text-sm">%</span>
                  <span className="min-w-[3.5rem] text-right tabular-nums">{fmtMoney(extraDiscAmount)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-input accent-primary"
                  />
                  Tax
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className={cn(inputDense, "w-14 text-right tabular-nums")}
                    inputMode="decimal"
                  />
                  <span className="text-sm">%</span>
                  <span className="min-w-[3.5rem] text-right tabular-nums">{fmtMoney(taxAmount)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t-2 border-border pt-2">
                <span className="text-base font-bold">Total</span>
                <span className="tabular-nums text-lg font-bold">{fmtMoney(grandTotal)}</span>
              </div>
            </div>
            <div role="tabpanel" hidden={totalsTab !== "discount"} className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              POC: Header / line discount breakdown can live here (legacy &quot;Discount&quot; tab).
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Sales transaction layout; wide line grid scrolls sideways on phones. API and lookup dialogs are not wired
        yet.
      </p>
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

export function SalesOrderPage() {
  return <SalesTransactionForm variant="sales-order" />;
}

export function SalesConfirmationPage() {
  return <SalesTransactionForm variant="sales-confirmation" />;
}

export function SalesReturnPage() {
  return <SalesTransactionForm variant="sales-return" />;
}

export function InvoicingProcessPage() {
  return <SalesTransactionForm variant="invoicing" />;
}
