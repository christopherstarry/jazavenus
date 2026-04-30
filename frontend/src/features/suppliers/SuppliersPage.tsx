import { useCallback, useEffect, useMemo, useState } from "react";

import { Check, FilePlus, MoreHorizontal, Save, Trash2, X } from "lucide-react";

import { useNavigate } from "react-router";

import { Button } from "#/components/ui/button";

import { Input } from "#/components/ui/input";

import { Label } from "#/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

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

import {
  LOOKUP_DEFAULT_PAGE_SIZE,
  LOOKUP_DIALOG_CONTENT_CLASS,
  LOOKUP_DIALOG_SCROLL_BODY_CLASS,
  LookupDialogResultScroll,
  LookupPaginationBar,
} from "#/components/ui/lookup-dialog-chrome";

export type SupplierRow = { supplierName: string; supplierCode: string };

const inputDense =
  "h-9 w-full rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:border-ring";

/** Legacy-style lookup list + extras for pagination — shown only in the ⋯ dialog */

function buildDemoSuppliers(): SupplierRow[] {
  const known: SupplierRow[] = [
    { supplierName: "DEVA INDUSTRIES PT", supplierCode: "103" },
    { supplierName: "A56", supplierCode: "A56" },
    { supplierName: "ABC", supplierCode: "ABC" },
    { supplierName: "ADIWARNA TUNGGAL JAYA CV", supplierCode: "92" },
  ];
  const rest: SupplierRow[] = [];
  for (let i = 0; i < 45; i++) {
    const code = String(200 + i);
    rest.push({ supplierName: `Sample Supplier ${code}`, supplierCode: code });
  }
  return [...known, ...rest];
}

const ALL_SUPPLIERS: SupplierRow[] = buildDemoSuppliers();

const DEMO_HEADERS: SupplierRow[] = [ALL_SUPPLIERS[0]!, ALL_SUPPLIERS[1]!, ALL_SUPPLIERS[2]!];

/**
 * Master Maintenance → Principle (legacy “Supplier” screen).
 * Supplier list appears only in the Supplier Code ⋯ lookup.
 */
export function SuppliersPage() {
  const navigate = useNavigate();

  const [recordIdx, setRecordIdx] = useState(0);

  const [supplierCode, setSupplierCode] = useState(DEMO_HEADERS[0]!.supplierCode);

  const [supplierName, setSupplierName] = useState(DEMO_HEADERS[0]!.supplierName);

  const [locked, setLocked] = useState(false);

  const [address, setAddress] = useState("");

  const [phone1, setPhone1] = useState("");

  const [phone2, setPhone2] = useState("");

  const [fax, setFax] = useState("");

  const [emailOffice, setEmailOffice] = useState("");

  const [salesman, setSalesman] = useState("");

  const [salesmanHp1, setSalesmanHp1] = useState("");

  const [salesmanHp2, setSalesmanHp2] = useState("");

  const [salesLeader, setSalesLeader] = useState("");

  const [salesLeaderPosition, setSalesLeaderPosition] = useState("");

  const [salesLeaderHp, setSalesLeaderHp] = useState("");

  const [topRetail, setTopRetail] = useState("");

  const [topJv, setTopJv] = useState("");

  const [discRetail, setDiscRetail] = useState("");

  const [discJv, setDiscJv] = useState("");

  const [returnable, setReturnable] = useState(true);

  const [contact, setContact] = useState("");

  const [dayVisit, setDayVisit] = useState("");

  const [npwpNumber, setNpwpNumber] = useState("");

  const [npwpDate, setNpwpDate] = useState("");

  const [pkpNumber, setPkpNumber] = useState("");

  const [pkpDate, setPkpDate] = useState("");

  const [note, setNote] = useState("");

  const [saleProduct, setSaleProduct] = useState("");

  const [lookupOpen, setLookupOpen] = useState(false);

  const applyHeader = useCallback((row: SupplierRow) => {
    setSupplierCode(row.supplierCode);

    setSupplierName(row.supplierName);
  }, []);

  const cycleRecord = useCallback(
    (i: number) => {
      const n = DEMO_HEADERS.length;

      const idx = ((i % n) + n) % n;

      setRecordIdx(idx);

      applyHeader(DEMO_HEADERS[idx]!);
    },

    [applyHeader]
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="New"
          onClick={() => cycleRecord(recordIdx)}
        >
          <FilePlus className="h-3.5 w-3.5" />

          <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />

          <span className="ml-1.5 hidden font-semibold sm:inline">Del</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="Save"
        >
          <Save className="h-3.5 w-3.5" />

          <span className="ml-1.5 hidden font-semibold sm:inline">Save</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 border-primary/60 px-3 text-sm"
          title="Execute"
        >
          <Check className="h-3.5 w-3.5 text-emerald-600" />

          <span className="ml-1.5 hidden font-semibold md:inline">Exec</span>
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
          title="Close"
          onClick={() => navigate(-1)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <LegacyDivisionFormNav
        onPreviousForm={() => cycleRecord(recordIdx - 1)}
        onNextForm={() => cycleRecord(recordIdx + 1)}
      />

      <div className="rounded-md border-2 border-border bg-card p-3 sm:p-4">
        <h2 className="mb-3 text-lg font-bold tracking-tight">:: Supplier</h2>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="supp-code" className="text-xs">
                    Supplier Code
                  </Label>

                  <div className="flex gap-1.5">
                    <input
                      id="supp-code"
                      value={supplierCode}
                      onChange={(e) => setSupplierCode(e.target.value)}
                      className={cn(inputDense, "max-w-[7rem] font-mono tabular-nums")}
                      autoComplete="off"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      title="Open supplier lookup"
                      onClick={() => setLookupOpen(true)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="supp-name" className="text-xs">
                  Supplier Name
                </Label>

                <input
                  id="supp-name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className={inputDense}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 lg:min-w-[8rem]">
              <span className="text-xs font-semibold text-muted-foreground">Status</span>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={locked}
                  onChange={(e) => setLocked(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-input accent-primary"
                />
                Locked
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs">
              Address
            </Label>

            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={cn(inputDense, "min-h-[3.5rem] resize-y py-1.5")}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="phone1" className="text-xs">
                Phone 1
              </Label>

              <input
                id="phone1"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className={inputDense}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone2" className="text-xs">
                Phone 2
              </Label>

              <div className="flex gap-1.5">
                <input
                  id="phone2"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className={inputDense}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 opacity-60"
                  disabled
                  title="POC: not wired"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="fax" className="text-xs">
                Fax
              </Label>

              <input
                id="fax"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                className={inputDense}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">
                Email Office
              </Label>

              <div className="flex gap-1.5">
                <Input
                  id="email"
                  type="email"
                  value={emailOffice}
                  onChange={(e) => setEmailOffice(e.target.value)}
                  className="h-9 px-2 text-sm"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 opacity-60"
                  disabled
                  title="POC: not wired"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <div className="space-y-1">
                <Label htmlFor="salesman" className="text-xs">
                  Salesman
                </Label>

                <div className="flex gap-1.5">
                  <input
                    id="salesman"
                    value={salesman}
                    onChange={(e) => setSalesman(e.target.value)}
                    className={cn(inputDense, "min-w-0 flex-1")}
                    autoComplete="off"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 opacity-60"
                    disabled
                    title="POC: not wired"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Legacy “HP 1 / HP 2” beside salesman — own row so they don’t crush in a flex line */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="salesman-hp1" className="text-xs">
                    HP 1
                  </Label>

                  <input
                    id="salesman-hp1"
                    value={salesmanHp1}
                    onChange={(e) => setSalesmanHp1(e.target.value)}
                    className={inputDense}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="salesman-hp2" className="text-xs">
                    HP 2
                  </Label>

                  <input
                    id="salesman-hp2"
                    value={salesmanHp2}
                    onChange={(e) => setSalesmanHp2(e.target.value)}
                    className={inputDense}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="sales-leader" className="text-xs">
                Sales Leader
              </Label>

              <div className="flex flex-wrap gap-1.5">
                <div className="flex min-w-[8rem] flex-1 gap-1.5">
                  <input
                    id="sales-leader"
                    value={salesLeader}
                    onChange={(e) => setSalesLeader(e.target.value)}
                    className={inputDense}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 opacity-60"
                    disabled
                    title="POC: not wired"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <input
                  placeholder="Position"
                  value={salesLeaderPosition}
                  onChange={(e) => setSalesLeaderPosition(e.target.value)}
                  className={cn(inputDense, "max-w-[10rem]")}
                />

                <input
                  placeholder="HP"
                  value={salesLeaderHp}
                  onChange={(e) => setSalesLeaderHp(e.target.value)}
                  className={cn(inputDense, "max-w-[10rem]")}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="top-retail" className="text-xs">
                  TOP Retail
                </Label>

                <input
                  id="top-retail"
                  value={topRetail}
                  onChange={(e) => setTopRetail(e.target.value)}
                  className={inputDense}
                />
              </div>

              <span className="pb-2 text-xs text-muted-foreground">Hari</span>
            </div>

            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="top-jv" className="text-xs">
                  TOP JV
                </Label>

                <input
                  id="top-jv"
                  value={topJv}
                  onChange={(e) => setTopJv(e.target.value)}
                  className={inputDense}
                />
              </div>

              <span className="pb-2 text-xs text-muted-foreground">Hari</span>
            </div>

            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="disc-retail" className="text-xs">
                  Disc Retail
                </Label>

                <input
                  id="disc-retail"
                  value={discRetail}
                  onChange={(e) => setDiscRetail(e.target.value)}
                  className={inputDense}
                />
              </div>

              <span className="pb-2 text-xs text-muted-foreground">%</span>
            </div>

            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="disc-jv" className="text-xs">
                  Disc JV
                </Label>

                <input
                  id="disc-jv"
                  value={discJv}
                  onChange={(e) => setDiscJv(e.target.value)}
                  className={inputDense}
                />
              </div>

              <span className="pb-2 text-xs text-muted-foreground">%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={returnable}
                onChange={(e) => setReturnable(e.target.checked)}
                className="h-4 w-4 rounded border-2 border-input accent-primary"
              />
              Returnable
            </label>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="contact" className="text-xs">
                  Contact
                </Label>

                <input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={inputDense}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="day-visit" className="text-xs">
                  Day Visit
                </Label>

                <input
                  id="day-visit"
                  value={dayVisit}
                  onChange={(e) => setDayVisit(e.target.value)}
                  className={inputDense}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 lg:col-span-2">
              <Label htmlFor="npwp" className="text-xs">
                NPWP Number
              </Label>

              <input
                id="npwp"
                value={npwpNumber}
                onChange={(e) => setNpwpNumber(e.target.value)}
                className={inputDense}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="npwp-date" className="text-xs">
                NPWP Date
              </Label>

              <input
                id="npwp-date"
                type="date"
                value={npwpDate}
                onChange={(e) => setNpwpDate(e.target.value)}
                className={inputDense}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 lg:col-span-2">
              <Label htmlFor="pkp" className="text-xs">
                PKP Number
              </Label>

              <input
                id="pkp"
                value={pkpNumber}
                onChange={(e) => setPkpNumber(e.target.value)}
                className={inputDense}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pkp-date" className="text-xs">
                PKP Date
              </Label>

              <input
                id="pkp-date"
                type="date"
                value={pkpDate}
                onChange={(e) => setPkpDate(e.target.value)}
                className={inputDense}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="note" className="text-xs">
                Note
              </Label>

              <div className="flex gap-1.5">
                <input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputDense}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 opacity-60"
                  disabled
                  title="POC: not wired"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sale-product" className="text-xs">
                Sale Product
              </Label>

              <input
                id="sale-product"
                value={saleProduct}
                onChange={(e) => setSaleProduct(e.target.value)}
                className={inputDense}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: supplier grid only in the Supplier Code lookup (⋯). Other ⋯ controls are visual
        placeholders.
      </p>

      <SupplierLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          applyHeader(row);
        }}
      />
    </div>
  );
}

type FieldKey = "supplierName" | "supplierCode";

type MatchKey = "contains" | "equals" | "startsWith";

function SupplierLookupDialog({
  open,

  onOpenChange,

  onSelect,
}: {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  onSelect: (row: SupplierRow) => void;
}) {
  const [field, setField] = useState<FieldKey>("supplierName");

  const [match, setMatch] = useState<MatchKey>("contains");

  const [autoSearch, setAutoSearch] = useState(true);

  const [filterText, setFilterText] = useState("");

  const [appliedQuery, setAppliedQuery] = useState("");

  const [selectedIdx, setSelectedIdx] = useState(0);

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(LOOKUP_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (!open) return;

    setFilterText("");

    setAppliedQuery("");

    setSelectedIdx(0);

    setPage(0);
  }, [open]);

  useEffect(() => {
    if (!open || !autoSearch) return;

    setAppliedQuery(filterText);

    setPage(0);

    setSelectedIdx(0);
  }, [filterText, autoSearch, open]);

  const rows = useMemo(() => {
    const raw = appliedQuery.trim();

    if (!raw) return [...ALL_SUPPLIERS];

    const q = raw.toLowerCase();

    const test = (value: string) => {
      const v = value.toLowerCase();

      switch (match) {
        case "equals":
          return v === q;

        case "startsWith":
          return v.startsWith(q);

        default:
          return v.includes(q);
      }
    };

    return ALL_SUPPLIERS.filter((row) =>
      field === "supplierName" ? test(row.supplierName) : test(row.supplierCode)
    );
  }, [appliedQuery, field, match]);

  useEffect(() => {
    setPage(0);

    setSelectedIdx(0);
  }, [field, match]);

  useEffect(() => {
    const pc = Math.max(1, Math.ceil(rows.length / pageSize));

    setPage((p) => Math.min(p, pc - 1));
  }, [rows.length, pageSize]);

  const sliceStart = page * pageSize;

  const pagedRows = rows.slice(sliceStart, sliceStart + pageSize);

  useEffect(() => {
    if (rows.length === 0) return;

    const start = page * pageSize;

    const endEx = Math.min(rows.length, start + pageSize);

    setSelectedIdx((i) => {
      if (i >= start && i < endEx) return i;

      return Math.min(start, rows.length - 1);
    });
  }, [page, pageSize, rows.length]);

  useEffect(() => {
    if (selectedIdx >= rows.length) setSelectedIdx(Math.max(0, rows.length - 1));
  }, [rows.length, selectedIdx]);

  const handleFind = () => {
    setAppliedQuery(filterText);

    setSelectedIdx(0);

    setPage(0);
  };

  const handleApply = () => {
    const row = rows[selectedIdx];

    if (row) onSelect(row);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={LOOKUP_DIALOG_CONTENT_CLASS}>
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="sr-only">Supplier lookup</DialogTitle>

          <p className="text-base font-bold">Supplier</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="space-y-2 rounded-md border-2 bg-muted/30 px-3 py-2.5">
            <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Criteria
            </div>

            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="sup-lookup-field" className="text-xs uppercase tracking-wide">
                  Field
                </Label>

                <select
                  id="sup-lookup-field"
                  value={field}
                  onChange={(e) => setField(e.target.value as FieldKey)}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="supplierName">SuppName</option>

                  <option value="supplierCode">Supplier Code</option>
                </select>
              </div>

              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="sup-lookup-match" className="text-xs uppercase tracking-wide">
                  Match
                </Label>

                <select
                  id="sup-lookup-match"
                  value={match}
                  onChange={(e) => setMatch(e.target.value as MatchKey)}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="contains">Contains</option>

                  <option value="equals">Equals</option>

                  <option value="startsWith">Starts with</option>
                </select>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 shrink-0"
                onClick={handleFind}
              >
                Find
              </Button>

              <label className="inline-flex min-h-[3rem] cursor-pointer items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  checked={autoSearch}
                  onChange={(e) => setAutoSearch(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-input accent-primary"
                />

                <span className="text-base font-semibold">Auto Search</span>
              </label>
            </div>

            <div className="pt-1">
              <Label htmlFor="sup-lookup-filter" className="sr-only">
                Search
              </Label>

              <Input
                id="sup-lookup-filter"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => {
                  if (!autoSearch && e.key === "Enter") handleFind();
                }}
                placeholder="Type supplier name or code…"
                className="h-11 max-w-xl text-base"
              />
            </div>
          </div>

          <LookupDialogResultScroll
            footer={
              rows.length > 0 ? (
                <LookupPaginationBar
                  total={rows.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz);

                    setPage(0);
                  }}
                />
              ) : null
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>

                  <TableHead className="w-[10rem]">Supplier Code</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      No rows match. Change criteria or search text.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row, idx) => {
                    const abs = sliceStart + idx;

                    return (
                      <TableRow
                        key={`${row.supplierCode}\0${row.supplierName}\0${abs}`}
                        role="button"
                        tabIndex={0}
                        data-state={selectedIdx === abs ? "selected" : undefined}
                        className={cn("cursor-pointer", selectedIdx === abs && "bg-accent")}
                        onClick={() => setSelectedIdx(abs)}
                        onDoubleClick={() => {
                          onSelect(row);

                          onOpenChange(false);
                        }}
                      >
                        <TableCell className="py-3">{row.supplierName}</TableCell>

                        <TableCell className="py-3 font-mono tabular-nums">
                          {row.supplierCode}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </LookupDialogResultScroll>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t-2 border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="mr-auto text-sm text-muted-foreground">
            {rows.length} row{rows.length === 1 ? "" : "s"}
          </p>

          <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-w-[8rem]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="lg"
              className="min-w-[8rem]"
              onClick={handleApply}
              disabled={rows.length === 0}
            >
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
