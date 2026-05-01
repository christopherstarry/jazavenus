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

export type PurchaseFormVariant = "purchase-order" | "receiving-entry" | "purchase-return";

type LineItem = {
  id: string;
  itemNo: string;
  description: string;
  quantity: number;
  price: number;
  uom?: string;
};

function fmtMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function configFor(v: PurchaseFormVariant) {
  switch (v) {
    case "purchase-order":
      return {
        title: ":: Purchase Order",
        secondDateLabel: "Delivery Date",
        warehouseLabel: "For Warehouse",
        showUom: false,
        showAddress: false,
      };
    case "receiving-entry":
      return {
        title: ":: Receiving Entry",
        secondDateLabel: "Value Date",
        warehouseLabel: "For Warehouse",
        showUom: true,
        showAddress: true,
      };
    case "purchase-return":
      return {
        title: ":: Purchase Return",
        secondDateLabel: "Value Date",
        warehouseLabel: "From Warehouse",
        showUom: true,
        showAddress: true,
      };
    default:
      return configFor("purchase-order");
  }
}

function PurchaseTransactionForm({ variant }: { variant: PurchaseFormVariant }) {
  const navigate = useNavigate();
  const cfg = configFor(variant);

  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vendorRefNo, setVendorRefNo] = useState("");

  const [manualNo, setManualNo] = useState(false);
  const [docNo, setDocNo] = useState("");
  const [postingDate, setPostingDate] = useState("2026-04-30");
  const [secondDate, setSecondDate] = useState("2026-04-30");
  const [warehouseCode, setWarehouseCode] = useState("001");

  const [lines] = useState<LineItem[]>([]);

  const [purchaseManager, setPurchaseManager] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [remarks, setRemarks] = useState("");

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxPercent, setTaxPercent] = useState("0");

  const totalBeforeTax = useMemo(
    () => lines.reduce((s, r) => s + r.quantity * r.price, 0),
    [lines],
  );

  const taxAmount = useMemo(() => {
    if (!taxEnabled) return 0;
    const p = Number.parseFloat(taxPercent.replace(/,/g, "."));
    if (!Number.isFinite(p) || p <= 0) return 0;
    return Math.round((totalBeforeTax * p) / 100);
  }, [taxEnabled, taxPercent, totalBeforeTax]);

  const grandTotal = totalBeforeTax + taxAmount;

  const noop = () => {};

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

      <div className="flex min-h-[36rem] flex-col rounded-md border-2 border-border bg-card p-3 sm:min-h-[40rem] sm:p-4">
        <h2 className="mb-3 shrink-0 text-lg font-bold tracking-tight">{cfg.title}</h2>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Left: vendor block */}
          <div className="space-y-3">
            <LookupField label="Vendor" value={vendorCode} onChange={setVendorCode} inputId="pur-vendor-code" />
            <div className="space-y-1">
              <Label htmlFor="pur-vendor-name" className="text-xs">
                Name
              </Label>
              <input
                id="pur-vendor-name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className={inputDense}
              />
            </div>
            {cfg.showAddress ? (
              <div className="space-y-1">
                <Label htmlFor="pur-address" className="text-xs">
                  Address
                </Label>
                <textarea
                  id="pur-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={cn(inputDense, "min-h-[4.5rem] py-2")}
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <Label htmlFor="pur-phone" className="text-xs">
                Phone
              </Label>
              <input id="pur-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputDense} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pur-vendor-ref" className="text-xs">
                Vendor Ref. No
              </Label>
              <input
                id="pur-vendor-ref"
                value={vendorRefNo}
                onChange={(e) => setVendorRefNo(e.target.value)}
                className={inputDense}
              />
            </div>
          </div>

          {/* Right: document / dates / warehouse */}
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
            <DateField id="pur-posting" label="Posting Date" value={postingDate} onChange={setPostingDate} />
            <DateField
              id="pur-second-date"
              label={cfg.secondDateLabel}
              value={secondDate}
              onChange={setSecondDate}
            />
            <LookupField
              label={cfg.warehouseLabel}
              value={warehouseCode}
              onChange={setWarehouseCode}
              inputId="pur-whs"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="mt-4 min-h-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line items</p>

          <div className="space-y-2 md:hidden">
            {lines.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                No lines yet (POC).
              </p>
            ) : (
              lines.map((row) => (
                <div
                  key={row.id}
                  className="rounded-md border-2 border-border bg-muted/15 px-3 py-2.5 text-sm"
                >
                  <p className="font-mono text-xs text-muted-foreground">{row.itemNo}</p>
                  <p className="font-medium">{row.description}</p>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 tabular-nums">
                    <span>Qty {row.quantity}</span>
                    <span>Price {fmtMoney(row.price)}</span>
                    <span className="font-semibold">Total {fmtMoney(row.quantity * row.price)}</span>
                    {cfg.showUom && row.uom ? <span>UOM {row.uom}</span> : null}
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
                  <TableHead className="text-right whitespace-nowrap">Quantity</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Price</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Total (LC)</TableHead>
                  {cfg.showUom ? <TableHead className="whitespace-nowrap">UOM</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={cfg.showUom ? 6 : 5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono tabular-nums">{row.itemNo}</TableCell>
                      <TableCell className="max-w-md">{row.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtMoney(row.price)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtMoney(row.quantity * row.price)}
                      </TableCell>
                      {cfg.showUom ? (
                        <TableCell className="tabular-nums">{row.uom ?? "—"}</TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 grid grid-cols-1 gap-4 border-t-2 border-border pt-4 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-3">
            <LookupField
              label="Purchase Manager"
              value={purchaseManager}
              onChange={setPurchaseManager}
              inputId="pur-pm"
            />
            <LookupField
              label="Payment Terms"
              value={paymentTerms}
              onChange={setPaymentTerms}
              inputId="pur-terms"
            />
            <div className="space-y-1">
              <Label htmlFor="pur-remarks" className="text-xs">
                Remarks
              </Label>
              <textarea
                id="pur-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className={cn(inputDense, "min-h-[6rem] py-2")}
              />
            </div>

            {variant === "receiving-entry" ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="button" variant="secondary" size="sm" className="min-w-[6rem]" disabled>
                  ORDER
                </Button>
                <Button type="button" variant="secondary" size="sm" className="min-w-[6rem]" disabled>
                  RETURN
                </Button>
              </div>
            ) : null}
            {variant === "purchase-return" ? (
              <div className="pt-1">
                <Button type="button" variant="secondary" size="sm" className="min-w-[6rem]" disabled>
                  Receive
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3 lg:justify-self-end lg:self-start lg:min-w-[20rem]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Total Before Tax</span>
              <span className="tabular-nums font-semibold">{fmtMoney(totalBeforeTax)}</span>
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
                  className={cn(inputDense, "w-16 text-right tabular-nums")}
                  inputMode="decimal"
                />
                <span className="text-sm">%</span>
                <span className="min-w-[4rem] text-right tabular-nums font-medium">{fmtMoney(taxAmount)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
              <span className="text-sm font-bold">Total</span>
              <span className="tabular-nums text-lg font-bold">{fmtMoney(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Legacy-style purchase transaction layout. Line items & lookups are not wired to the API yet.
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

export function PurchaseOrderPage() {
  return <PurchaseTransactionForm variant="purchase-order" />;
}

export function ReceivingEntryPage() {
  return <PurchaseTransactionForm variant="receiving-entry" />;
}

export function PurchaseReturnPage() {
  return <PurchaseTransactionForm variant="purchase-return" />;
}
