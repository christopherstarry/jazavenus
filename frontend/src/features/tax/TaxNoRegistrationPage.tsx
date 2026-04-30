import { useCallback, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FilePlus,
  MoreHorizontal,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { LookupPaginationBar } from "#/components/ui/lookup-dialog-chrome";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";

const SAMPLE_CUSTOMERS = [
  { code: "838", name: "LILY COSMETIK" },
  { code: "91", name: "ALFAMART PT SUMBER ALFARIA TRI TRI" },
  { code: "1576", name: "HYPERMART TRANSMART PANAM" },
  { code: "1204", name: "METRO HYPER MARKET SURABAYA" },
  { code: "892", name: "INDOMARET CABANG SELATAN" },
  { code: "441", name: "FRESH MART BANDUNG" },
  { code: "903", name: "GIANT EXTRA MALL BOTANI" },
  { code: "661", name: "SUPERMART NUSANTARA UTAMA" },
] as const;

function formatNpwp(seq: number): string {
  const a = ((seq * 17) % 900) + 100;
  const b = (seq % 990) + 10;
  const c = seq % 9;
  const d = (seq % 899) + 100;
  return `${Math.floor(a / 100)}.${String(a % 100).padStart(3, "0")}.${c}.${Math.floor(b / 100)}.${String(d).padStart(3, "0")}`;
}

function padSerial(n: number): string {
  return String(n).padStart(8, "0");
}

export type TaxLineRow = {
  serialNo: string;
  invoiceNo: string;
  taxDateIso: string;
  custCode: string;
  customerName: string;
  npwp: string;
};

/** Exactly 100 demo detail lines — pagination is client-side only (POC). */
function buildTaxLineRows(count: number): TaxLineRow[] {
  const start = Date.UTC(2023, 0, 5);
  const dayMs = 86400000;
  const rows: TaxLineRow[] = [];
  for (let i = 0; i < count; i++) {
    const cust = SAMPLE_CUSTOMERS[i % SAMPLE_CUSTOMERS.length]!;
    const d = new Date(start + ((i * 13) % 400) * dayMs);
    const taxDateIso = d.toISOString().slice(0, 10);
    rows.push({
      serialNo: padSerial(107 + i * 3 + (i % 7)),
      invoiceNo: String(85 + i * 11 + ((i * 23) % 300)),
      taxDateIso,
      custCode: cust.code.padStart(3, "0").slice(-4),
      customerName: `${cust.name}`,
      npwp: formatNpwp(100 + i),
    });
  }
  return rows;
}

const ALL_ROWS: TaxLineRow[] = buildTaxLineRows(100);

const DEMO_REGISTRATIONS = [
  { registrationNo: "1", regDate: "2008-08-31", fromNum: "83", toNum: "5000", reference: "LANJUTAN NO PAJAK", taxUsed: 4 },
  { registrationNo: "2", regDate: "2010-03-15", fromNum: "1", toNum: "999", reference: "BATCH PENGGANTI FAKTUR", taxUsed: 12 },
  { registrationNo: "3", regDate: "2012-11-02", fromNum: "100", toNum: "2500", reference: "RENCANA WILAYAH BARAT", taxUsed: 8 },
];

export function TaxNoRegistrationPage() {
  const navigate = useNavigate();
  const [regIdx, setRegIdx] = useState(0);
  const [registrationNo, setRegistrationNo] = useState(DEMO_REGISTRATIONS[0]!.registrationNo);
  const [regDate, setRegDate] = useState(DEMO_REGISTRATIONS[0]!.regDate);
  const [fromNum, setFromNum] = useState(DEMO_REGISTRATIONS[0]!.fromNum);
  const [toNum, setToNum] = useState(DEMO_REGISTRATIONS[0]!.toNum);
  const [reference, setReference] = useState(DEMO_REGISTRATIONS[0]!.reference);
  const [demoTaxUsed, setDemoTaxUsed] = useState(DEMO_REGISTRATIONS[0]!.taxUsed);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const applyDemoReg = useCallback((i: number) => {
    const d = DEMO_REGISTRATIONS[(i + DEMO_REGISTRATIONS.length) % DEMO_REGISTRATIONS.length]!;
    setRegIdx((i + DEMO_REGISTRATIONS.length) % DEMO_REGISTRATIONS.length);
    setRegistrationNo(d.registrationNo);
    setRegDate(d.regDate);
    setFromNum(d.fromNum);
    setToNum(d.toNum);
    setReference(d.reference);
    setDemoTaxUsed(d.taxUsed);
    setPage(0);
  }, []);

  const totalTaxCalc = useMemo(() => {
    const a = Number.parseInt(fromNum.replace(/\D/g, "") || "0", 10);
    const b = Number.parseInt(toNum.replace(/\D/g, "") || "0", 10);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return 0;
    return b - a + 1;
  }, [fromNum, toNum]);

  const taxAvailable = Math.max(0, totalTaxCalc - demoTaxUsed);

  const sliceStart = page * pageSize;
  const visibleRows = ALL_ROWS.slice(sliceStart, sliceStart + pageSize);

  const pageCount = Math.max(1, Math.ceil(ALL_ROWS.length / pageSize));

  return (
    <div className="space-y-3 min-w-0">
      {/* Legacy-style action bar */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button type="button" variant="outline" size="sm" title="New" className="h-11 shrink-0" onClick={() => applyDemoReg(regIdx)}>
          <FilePlus className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline font-semibold">New</span>
        </Button>
        <Button type="button" variant="outline" size="sm" title="Delete" className="h-11 shrink-0" onClick={() => setDemoTaxUsed((u) => Math.max(0, u - 1))}>
          <Trash2 className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline font-semibold">Del</span>
        </Button>
        <Button type="button" variant="outline" size="sm" title="Save" className="h-11 shrink-0" onClick={() => { /* POC */ }}>
          <Save className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline font-semibold">Save</span>
        </Button>
        <Button type="button" variant="outline" size="sm" title="Execute" className="h-11 shrink-0 border-primary/60" onClick={() => { /* POC */ }}>
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="ml-2 hidden md:inline font-semibold">Exec</span>
        </Button>
        <div className="mx-1 hidden sm:block h-7 w-px bg-border shrink-0" aria-hidden />
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Grid first page"
            className="h-11 w-11"
            disabled={page <= 0}
            onClick={() => setPage(0)}
          >
            <ChevronsLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Grid previous page"
            className="h-11 w-11"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Grid next page"
            className="h-11 w-11"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Grid last page"
            className="h-11 w-11"
            disabled={page >= pageCount - 1}
            onClick={() => setPage(pageCount - 1)}
          >
            <ChevronsRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1" />
        <Button type="button" variant="ghost" size="icon" title="Close" className="h-11 w-11 text-destructive hover:text-destructive" onClick={() => navigate(-1)}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <LegacyDivisionFormNav onPreviousForm={() => applyDemoReg(regIdx - 1)} onNextForm={() => applyDemoReg(regIdx + 1)} />

      {/* Header fields */}
      <div className="rounded-md border-2 border-border bg-card p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Tax Number Registration</h2>

        <div className="flex flex-col gap-5">
          {/*
            Single 4-column grid on large screens so:
            Reg. Date ↔ Tax No. Used, From Number ↔ Tax No. Available (same vertical track).
            Below lg, fields stack in source order.
          */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 lg:grid-cols-4">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-reg-no">Registration No.</Label>
              <div className="flex w-full gap-2">
                <Input
                  id="tax-reg-no"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  autoComplete="off"
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-12 w-12"
                  title="Browse registrations (POC)"
                  onClick={() => applyDemoReg(regIdx + 1)}
                >
                  <MoreHorizontal className="h-5 w-5" aria-hidden />
                </Button>
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-reg-date">Reg. Date</Label>
              <div className="relative w-full">
                <Input id="tax-reg-date" type="date" value={regDate.slice(0, 10)} onChange={(e) => setRegDate(e.target.value)} className="h-12 w-full pr-10" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" aria-hidden />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-from-number">From Number</Label>
              <Input id="tax-from-number" value={fromNum} onChange={(e) => setFromNum(e.target.value)} inputMode="numeric" className="h-12 w-full" />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-to-number">To Number</Label>
              <Input id="tax-to-number" value={toNum} onChange={(e) => setToNum(e.target.value)} inputMode="numeric" className="h-12 w-full" />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-total" className="text-sm leading-snug">
                Total Tax No.
              </Label>
              <Input
                id="tax-total"
                readOnly
                tabIndex={-1}
                value={String(totalTaxCalc)}
                aria-readonly="true"
                className="h-12 w-full bg-muted tabular-nums text-base"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-used" className="text-sm leading-snug">
                Tax No. Used
              </Label>
              <Input
                id="tax-used"
                readOnly
                tabIndex={-1}
                value={String(demoTaxUsed)}
                aria-readonly="true"
                className="h-12 w-full bg-muted tabular-nums text-base"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="tax-available" className="text-sm leading-snug">
                Tax No. Available
              </Label>
              <Input
                id="tax-available"
                readOnly
                tabIndex={-1}
                value={String(taxAvailable)}
                aria-readonly="true"
                className="h-12 w-full bg-muted tabular-nums text-base"
              />
            </div>
            {/* Spacer keeps row-2 visually under row-1 cols 1–3; column 4 intentionally empty */}
            <div className="hidden min-w-0 lg:block" aria-hidden />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-ref">Reference</Label>
            <Input id="tax-ref" value={reference} onChange={(e) => setReference(e.target.value)} className="h-12" />
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="rounded-md border-2 border-border bg-card overflow-hidden flex flex-col min-h-0 min-w-0">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Serial No.</TableHead>
                <TableHead className="whitespace-nowrap">Invoice No.</TableHead>
                <TableHead className="whitespace-nowrap">Tax Date</TableHead>
                <TableHead className="whitespace-nowrap">CustmrCode</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead className="whitespace-nowrap">NPWP No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.serialNo + row.invoiceNo}>
                  <TableCell className="tabular-nums">{row.serialNo}</TableCell>
                  <TableCell className="tabular-nums">{row.invoiceNo}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    {new Date(row.taxDateIso + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" })}
                  </TableCell>
                  <TableCell className="tabular-nums">{row.custCode}</TableCell>
                  <TableCell className="font-medium">{row.customerName}</TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">{row.npwp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <LookupPaginationBar
          total={ALL_ROWS.length}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(Math.min(Math.max(0, p), pageCount - 1))}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(0);
          }}
          pageSizeOptions={[10, 15, 25, 50, 100]}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        POC: 100 sample detail lines · Header totals derive from From/To; “Tax No. Used” is demo data from Prev/Next Form.
      </p>
    </div>
  );
}
