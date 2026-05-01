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

export type InventoryFormVariant = "incoming-bpb" | "outgoing-bbk" | "inter-warehouse";

type LineItem = {
  id: string;
  itemNo: string;
  description: string;
  quantity: number;
  price: number;
};

function fmtMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function configFor(v: InventoryFormVariant) {
  switch (v) {
    case "incoming-bpb":
      return {
        title: ":: Incoming Transaction",
        warehouseLabel: "For Warehouse",
        toolbar: "undo" as const,
        showFromBbk: true,
      };
    case "outgoing-bbk":
      return {
        title: ":: Outgoing Transaction",
        warehouseLabel: "From Warehouse",
        toolbar: "delete" as const,
        showFromBbk: false,
      };
    case "inter-warehouse":
      return {
        title: ":: Inter Warehouse Transaction",
        warehouseLabel: null,
        toolbar: "delete" as const,
        showFromBbk: false,
      };
    default:
      return configFor("incoming-bpb");
  }
}

function InventoryTransactionForm({ variant }: { variant: InventoryFormVariant }) {
  const navigate = useNavigate();
  const cfg = configFor(variant);

  const [customerCode, setCustomerCode] = useState("");
  const [customerName] = useState("");
  const [shipTo] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const [manualNo, setManualNo] = useState(false);
  const [docNo, setDocNo] = useState("");
  const [priceListCode, setPriceListCode] = useState("HET");
  const [warehouseCode, setWarehouseCode] = useState("001");
  const [warehouseToCode, setWarehouseToCode] = useState("");
  const [trxDate, setTrxDate] = useState("2026-04-30");
  const [taxDate, setTaxDate] = useState("2026-04-30");
  const [shipToCode, setShipToCode] = useState("000");

  const [lines] = useState<LineItem[]>([]);

  const [remarks, setRemarks] = useState("");
  const [documentStatus, setDocumentStatus] = useState("");
  const [footerPriceList, setFooterPriceList] = useState("HET");
  const [salesEmployee, setSalesEmployee] = useState("");

  const lineTotal = useMemo(() => lines.reduce((s, r) => s + r.quantity * r.price, 0), [lines]);

  const noop = () => {};

  const headerLeft =
    variant === "inter-warehouse" ? (
      <div className="space-y-3">
        <LookupField label="Customer" value={customerCode} onChange={setCustomerCode} inputId="inv-iw-cust" />
        <div className="space-y-1">
          <Label htmlFor="inv-iw-name" className="text-xs">
            Name
          </Label>
          <input
            id="inv-iw-name"
            value={customerName}
            readOnly
            className={cn(inputDense, "bg-muted/40")}
            aria-readonly="true"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="inv-iw-shipto" className="text-xs">
            Ship To
          </Label>
          <input
            id="inv-iw-shipto"
            value={shipTo}
            readOnly
            className={cn(inputDense, "bg-muted/40")}
            aria-readonly="true"
          />
        </div>
        <LookupField
          label="Contact Person"
          value={contactPerson}
          onChange={setContactPerson}
          inputId="inv-iw-contact"
        />
      </div>
    ) : (
      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Number</span>
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
        <LookupField label="Price List" value={priceListCode} onChange={setPriceListCode} inputId="inv-pl" />
        {cfg.warehouseLabel ? (
          <LookupField
            label={cfg.warehouseLabel}
            value={warehouseCode}
            onChange={setWarehouseCode}
            inputId="inv-whs-single"
          />
        ) : null}
      </div>
    );

  const headerRight =
    variant === "inter-warehouse" ? (
      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Number</span>
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
        <DateField id="inv-iw-post" label="Posting Date" value={trxDate} onChange={setTrxDate} />
        <DateField id="inv-iw-tax" label="Tax Date" value={taxDate} onChange={setTaxDate} />
        <LookupField label="From Warehouse" value={warehouseCode} onChange={setWarehouseCode} inputId="inv-wh-from" />
        <LookupField label="To Warehouse" value={warehouseToCode} onChange={setWarehouseToCode} inputId="inv-wh-to" />
      </div>
    ) : (
      <div className="space-y-3">
        <DateField id="inv-date" label="Date" value={trxDate} onChange={setTrxDate} />
        <LookupField label="Customer" value={customerCode} onChange={setCustomerCode} inputId="inv-cust" />
        <LookupField label="Ship To Code" value={shipToCode} onChange={setShipToCode} inputId="inv-ship" />
      </div>
    );

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="New">
          <FilePlus className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
        </Button>
        {cfg.toolbar === "undo" ? (
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
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 px-3 text-sm"
            title="Delete"
            disabled
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="ml-1.5 hidden font-semibold sm:inline">Del</span>
          </Button>
        )}
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
          {headerLeft}
          {headerRight}
        </div>

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
                  <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {variant === "inter-warehouse" ? (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t-2 border-border pt-4 lg:grid-cols-[1fr_auto] lg:gap-8">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="inv-iw-remarks" className="text-xs">
                  Remarks
                </Label>
                <textarea
                  id="inv-iw-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className={cn(inputDense, "min-h-[6rem] py-2")}
                />
              </div>
              <LookupField
                label="Price List"
                value={footerPriceList}
                onChange={setFooterPriceList}
                inputId="inv-iw-pl-foot"
              />
              <LookupField
                label="Sales Employee"
                value={salesEmployee}
                onChange={setSalesEmployee}
                inputId="inv-iw-sales"
              />
            </div>
            <div className="flex flex-col justify-end gap-2 lg:min-w-[14rem] lg:text-right">
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <span className="text-sm font-medium">Total</span>
                <p className="tabular-nums text-2xl font-bold">{fmtMoney(lineTotal)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t-2 border-border pt-4 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="inv-remarks" className="text-xs">
                  Remarks
                </Label>
                <textarea
                  id="inv-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className={cn(inputDense, "min-h-[6rem] py-2")}
                />
              </div>
              <LookupField
                label="Document Status"
                value={documentStatus}
                onChange={setDocumentStatus}
                inputId="inv-doc-st"
              />
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="w-full max-w-md rounded-md border border-border bg-muted/20 p-3 lg:text-right">
                <span className="text-sm font-medium">Total</span>
                <p className="tabular-nums text-2xl font-bold">{fmtMoney(lineTotal)}</p>
              </div>
              {cfg.showFromBbk ? (
                <Button type="button" variant="secondary" className="w-full max-w-md shrink-0 sm:w-auto" disabled>
                  From BBK
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Legacy inventory transaction layout. Line items and lookups are not wired to the API yet.
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

export function IncomingTransactionBpbPage() {
  return <InventoryTransactionForm variant="incoming-bpb" />;
}

export function OutgoingTransactionBbkPage() {
  return <InventoryTransactionForm variant="outgoing-bbk" />;
}

export function InterWarehouseTransactionPage() {
  return <InventoryTransactionForm variant="inter-warehouse" />;
}
