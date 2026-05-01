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

type PaymentLine = {
  id: string;
  invoiceNo: string;
  date: string;
  total: number;
  balanceDue: number;
  totalPayment: number;
  cashAmount: number;
  transferAmount: number;
};

/** id-ID style decimals (e.g. 1.234,56) — common in legacy ID ERPs */
function fmtId(n: number): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtIdInt(n: number): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function BankTransferTransactionPage() {
  const navigate = useNavigate();
  const noop = () => {};

  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [billTo, setBillTo] = useState("");
  const [collectorCode, setCollectorCode] = useState("");

  const [manualNo, setManualNo] = useState(false);
  const [docNo, setDocNo] = useState("");
  const [entryDate, setEntryDate] = useState("2026-04-30");
  const [lhppDate, setLhppDate] = useState("2026-04-30");
  const [reference, setReference] = useState("");

  const [lines] = useState<PaymentLine[]>([]);

  const [bottomTab, setBottomTab] = useState<"invoice" | "check">("invoice");
  const [remarks, setRemarks] = useState("");

  const totals = useMemo(() => {
    const cash = lines.reduce((s, r) => s + r.cashAmount, 0);
    const transfer = lines.reduce((s, r) => s + r.transferAmount, 0);
    return {
      cash,
      transfer,
      check: 0,
      others: 0,
      ret: 0,
      adjustment: 0,
      payment: cash + transfer,
    };
  }, [lines]);

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="New">
          <FilePlus className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="Undo" disabled>
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

      <div className="flex min-h-[32rem] flex-col rounded-md border-2 border-border bg-card p-3 sm:p-4">
        <h2 className="mb-3 text-lg font-bold tracking-tight">:: Bank Transfer Transaction</h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-3">
            <LookupField
              label="Customer Code"
              value={customerCode}
              onChange={setCustomerCode}
              inputId="btt-cust"
            />
            <div className="space-y-1">
              <Label htmlFor="btt-name" className="text-xs">
                Name
              </Label>
              <input id="btt-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputDense} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="btt-billto" className="text-xs">
                Bill To
              </Label>
              <textarea
                id="btt-billto"
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                rows={3}
                className={cn(inputDense, "min-h-[4.5rem] py-2")}
              />
            </div>
            <LookupField
              label="Collector Code"
              value={collectorCode}
              onChange={setCollectorCode}
              inputId="btt-coll"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">No.</span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                  className={cn(inputDense, "max-w-[12rem] flex-1 font-mono tabular-nums")}
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
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled title="Lookup">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DateField id="btt-entry" label="Entry Date" value={entryDate} onChange={setEntryDate} />
            <DateField id="btt-lhpp" label="LHPP Date" value={lhppDate} onChange={setLhppDate} />
            <div className="space-y-1">
              <Label htmlFor="btt-ref" className="text-xs">
                Reference
              </Label>
              <input id="btt-ref" value={reference} onChange={(e) => setReference(e.target.value)} className={inputDense} />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment reference</p>
          <div className="max-h-[min(40vh,20rem)] overflow-auto rounded-md border-2 border-border bg-background">
            <Table className="min-w-[56rem] text-sm">
              <TableHeader>
                <TableRow className="border-b-2 border-border bg-muted/40 hover:bg-muted/40">
                  <TableHead className="whitespace-nowrap">Invoice No</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Balance Due</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Total Payment</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Cash Amount</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Transfer Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No rows (POC).
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.invoiceNo}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtIdInt(r.total)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtIdInt(r.balanceDue)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtId(r.totalPayment)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtId(r.cashAmount)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtId(r.transferAmount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t-2 border-border pt-4 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 border-b border-border pb-2">
              {(
                [
                  ["invoice", "Invoice"],
                  ["check", "Check/Giro"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={bottomTab === id}
                  onClick={() => setBottomTab(id)}
                  className={cn(
                    "rounded-md border-2 px-3 py-1.5 text-xs font-semibold sm:text-sm",
                    bottomTab === id
                      ? "border-primary bg-muted/50 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div role="tabpanel" hidden={bottomTab !== "invoice"} className="space-y-1">
              <Label htmlFor="btt-remarks" className="text-xs">
                Remarks
              </Label>
              <textarea
                id="btt-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={5}
                className={cn(inputDense, "min-h-[8rem] py-2")}
              />
            </div>
            <div role="tabpanel" hidden={bottomTab !== "check"} className="text-sm text-muted-foreground">
              POC: Check/Giro lines (legacy second tab).
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-border bg-muted/15 p-3 text-sm lg:self-start">
            {(
              [
                ["Total Cash", totals.cash],
                ["Total Transfer", totals.transfer],
                ["Total Check", totals.check],
                ["Total Others", totals.others],
                ["Total Return", totals.ret],
                ["Total Adjustment", totals.adjustment],
                ["Total Payment", totals.payment],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums font-semibold">{fmtId(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: Bank transfer layout; amounts use Indonesian-style grouping/decimals. Not wired to API.
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
        <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled title="Lookup">
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
