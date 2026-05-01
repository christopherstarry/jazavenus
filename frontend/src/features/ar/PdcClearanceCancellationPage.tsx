import { useState } from "react";
import {
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FilePlus,
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
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";

const inputDense =
  "h-9 w-full min-w-0 rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:border-ring";
const selectDense =
  "h-9 w-full min-w-0 rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm font-medium";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Legacy window title spelling */
export function PdcClearanceCancellationPage() {
  const navigate = useNavigate();
  const noop = () => {};

  const [clearingDate, setClearingDate] = useState("2026-04-30");
  const [arYear, setArYear] = useState("2026");
  const [arMonth, setArMonth] = useState<string>("April");

  const [rows] = useState<
    {
      id: string;
      checkNo: string;
      bankCode: string;
      bankName: string;
      date: string;
      amount: number;
      clearing: boolean;
      clearingDate: string;
    }[]
  >([]);

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="New">
          <FilePlus className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="Delete">
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

      <LegacyDivisionFormNav onPreviousForm={noop} onNextForm={noop} />

      <div className="rounded-md border-2 border-border bg-card p-3 sm:p-4">
        <h2 className="mb-4 text-lg font-bold tracking-tight">:: PDC Clearance Cancelation</h2>

        <div className="mb-4 flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[10rem] flex-1 space-y-1">
            <Label htmlFor="pdc-clearing" className="text-xs">
              Clearing Date
            </Label>
            <input
              id="pdc-clearing"
              type="date"
              value={clearingDate}
              onChange={(e) => setClearingDate(e.target.value)}
              className={inputDense}
            />
          </div>
          <div className="min-w-[8rem] space-y-1">
            <Label htmlFor="pdc-year" className="text-xs">
              From AR Report Year
            </Label>
            <select
              id="pdc-year"
              value={arYear}
              onChange={(e) => setArYear(e.target.value)}
              className={selectDense}
            >
              {["2024", "2025", "2026", "2027"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[10rem] space-y-1">
            <Label htmlFor="pdc-month" className="text-xs">
              From AR Report Month
            </Label>
            <select
              id="pdc-month"
              value={arMonth}
              onChange={(e) => setArMonth(e.target.value)}
              className={selectDense}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="secondary" size="sm" className="h-9 shrink-0">
            Filter
          </Button>
        </div>

        <div className="max-h-[min(55vh,28rem)] overflow-auto rounded-md border-2 border-border bg-background">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="border-b-2 border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="whitespace-nowrap">Check/Giro No.</TableHead>
                <TableHead className="whitespace-nowrap">Bank Code</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="text-center whitespace-nowrap">Clearing</TableHead>
                <TableHead className="whitespace-nowrap">Clearing Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No records. Adjust filters and click Filter (POC).
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono">{r.checkNo}</TableCell>
                    <TableCell className="font-mono">{r.bankCode}</TableCell>
                    <TableCell>{r.bankName}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.amount.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-center">
                      <input type="checkbox" checked={r.clearing} readOnly className="h-4 w-4 accent-primary" />
                    </TableCell>
                    <TableCell>{r.clearingDate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: PDC clearance cancelation — filter bar and grid columns match legacy; no API yet.
      </p>
    </div>
  );
}
