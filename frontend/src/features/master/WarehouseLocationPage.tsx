import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { CodeDescriptionRow } from "#/features/common/CodeDescriptionMasterPage";
import {
  LOOKUP_DEFAULT_PAGE_SIZE,
  LOOKUP_DIALOG_CONTENT_CLASS,
  LOOKUP_DIALOG_SCROLL_BODY_CLASS,
  LookupDialogResultScroll,
  LookupPaginationBar,
} from "#/components/ui/lookup-dialog-chrome";

import { ALL_WH_TYPES } from "#/features/master/ProductWarehouseMasters";

/** WareHouse Name | WareHouse Code in VB lookup */
export type WarehouseLocationRow = { warehouseName: string; warehouseCode: string };

function buildWarehouseLocations(): WarehouseLocationRow[] {
  const known: WarehouseLocationRow[] = [
    { warehouseCode: "001", warehouseName: "MAIN WA" },
    { warehouseCode: "002", warehouseName: "Gudang Utama Cirebon" },
    { warehouseCode: "101", warehouseName: "GUDANG RETUR" },
    { warehouseCode: "300", warehouseName: "KONSINYASI YOGYA CAB 1" },
    { warehouseCode: "301", warehouseName: "KONSINYASI YOGYA CAB 2" },
    { warehouseCode: "302", warehouseName: "KONSINYASI INDMARET BD" },
  ];
  const rest: WarehouseLocationRow[] = [];
  for (let i = 1; i <= 92; i++) {
    rest.push({
      warehouseCode: `POC-${String(i).padStart(3, "0")}`,
      warehouseName: `POC Warehouse ${String(i).padStart(3, "0")}`,
    });
  }
  return [...known, ...rest];
}

const ALL_WAREHOUSE_LOCATIONS = buildWarehouseLocations();

type DemoHdr = {
  wh: WarehouseLocationRow;
  type: CodeDescriptionRow;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const DEMO_HEADERS: DemoHdr[] = [
  {
    wh: ALL_WAREHOUSE_LOCATIONS[0]!,
    type: ALL_WH_TYPES.find((r) => r.code === "0")!,
    description: "MAIN WA",
    address: "BANDUNG",
    city: "",
    state: "",
    zip: "",
  },
  {
    wh: ALL_WAREHOUSE_LOCATIONS[1]!,
    type: ALL_WH_TYPES.find((r) => r.code === "0")!,
    description: "Gudang Cirebon Utama",
    address: "CIREBON",
    city: "CIREBON",
    state: "",
    zip: "",
  },
  {
    wh: ALL_WAREHOUSE_LOCATIONS[2]!,
    type: ALL_WH_TYPES.find((r) => r.code === "1")!,
    description: "Retur pooling",
    address: "BANDUNG",
    city: "BANDUNG",
    state: "",
    zip: "40123",
  },
];

export function WarehouseLocationPage() {
  const navigate = useNavigate();
  const [recordIdx, setRecordIdx] = useState(0);
  const [warehouseCode, setWarehouseCode] = useState(DEMO_HEADERS[0]!.wh.warehouseCode);
  const [whTypeCode, setWhTypeCode] = useState(DEMO_HEADERS[0]!.type.code);
  const [whTypeDesc, setWhTypeDesc] = useState(DEMO_HEADERS[0]!.type.description);
  const [description, setDescription] = useState(DEMO_HEADERS[0]!.description);
  const [address, setAddress] = useState(DEMO_HEADERS[0]!.address);
  const [city, setCity] = useState(DEMO_HEADERS[0]!.city);
  const [state, setState] = useState(DEMO_HEADERS[0]!.state);
  const [zip, setZip] = useState(DEMO_HEADERS[0]!.zip);
  const [locked, setLocked] = useState(false);
  const [lookupWhOpen, setLookupWhOpen] = useState(false);
  const [lookupTypeOpen, setLookupTypeOpen] = useState(false);

  const applyDemo = useCallback((idx: number) => {
    const n = DEMO_HEADERS.length;
    const i = ((idx % n) + n) % n;
    setRecordIdx(i);
    const d = DEMO_HEADERS[i]!;
    setWarehouseCode(d.wh.warehouseCode);
    setWhTypeCode(d.type.code);
    setWhTypeDesc(d.type.description);
    setDescription(d.description);
    setAddress(d.address);
    setCity(d.city);
    setState(d.state);
    setZip(d.zip);
  }, []);

  const cycle = useCallback((i: number) => applyDemo(i), [applyDemo]);

  const vcr = DEMO_HEADERS.length;

  const inputMuted = "max-w-[10rem] font-mono tabular-nums";

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" title="New" onClick={() => cycle(recordIdx)}>
          <FilePlus className="h-4 w-4" />
          <span className="ml-2 hidden font-semibold sm:inline">New</span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" title="Delete">
          <Trash2 className="h-4 w-4" />
          <span className="ml-2 hidden font-semibold sm:inline">Del</span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" title="Save">
          <Save className="h-4 w-4" />
          <span className="ml-2 hidden font-semibold sm:inline">Save</span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-11 shrink-0 border-primary/60" title="Execute">
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="ml-2 hidden font-semibold md:inline">Exec</span>
        </Button>
        <div className="mx-1 hidden h-7 w-px shrink-0 bg-border sm:block" aria-hidden />
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" title="First" onClick={() => cycle(0)}>
            <ChevronsLeft className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" title="Previous" onClick={() => cycle(recordIdx - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" title="Next" onClick={() => cycle(recordIdx + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" title="Last" onClick={() => cycle(vcr - 1)}>
            <ChevronsRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1" />
        <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-destructive hover:text-destructive" title="Close" onClick={() => navigate(-1)}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <LegacyDivisionFormNav onPreviousForm={() => cycle(recordIdx - 1)} onNextForm={() => cycle(recordIdx + 1)} />

      <div className="space-y-4 rounded-md border-2 border-border bg-card p-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Warehouse Location</h2>

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-2">
            <Label htmlFor="wh-loc-code">Warehouse Code</Label>
            <div className="flex gap-2">
              <Input id="wh-loc-code" value={warehouseCode} onChange={(e) => setWarehouseCode(e.target.value)} className={inputMuted} autoComplete="off" />
              <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" title="Warehouse lookup" onClick={() => setLookupWhOpen(true)}>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex min-w-0 flex-wrap items-end gap-2 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="wh-loc-type">Warehouse Type</Label>
              <div className="flex gap-2">
                <Input id="wh-loc-type" value={whTypeCode} onChange={(e) => setWhTypeCode(e.target.value)} className="w-[4.5rem] font-mono tabular-nums" autoComplete="off" />
                <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" title="Warehouse type lookup" onClick={() => setLookupTypeOpen(true)}>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="min-w-[10rem] flex-1 space-y-2 pb-px">
              <Label className="sr-only">Warehouse type description</Label>
              <Input value={whTypeDesc} onChange={(e) => setWhTypeDesc(e.target.value)} aria-label="Warehouse type description" placeholder="Main" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wh-desc">Description</Label>
            <Input id="wh-desc" value={description} onChange={(e) => setDescription(e.target.value)} autoComplete="off" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wh-addr">Address</Label>
            <Input id="wh-addr" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-city">City</Label>
            <div className="flex gap-2">
              <Input id="wh-city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="off" />
              <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 opacity-50" disabled title="POC: not wired">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-state">State</Label>
            <div className="flex gap-2">
              <Input id="wh-state" value={state} onChange={(e) => setState(e.target.value)} autoComplete="off" />
              <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 opacity-50" disabled title="POC: not wired">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-zip">Zip Code</Label>
            <Input id="wh-zip" value={zip} onChange={(e) => setZip(e.target.value)} autoComplete="off" />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="h-5 w-5 rounded border-2 border-input accent-primary" />
          Locked
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        POC: Warehouse lookup uses WareHouse Name + WareHouse Code with pagination · City / State lookups are placeholders.
      </p>

      <WarehouseLocationLookup
        open={lookupWhOpen}
        onOpenChange={setLookupWhOpen}
        onSelect={(row) => {
          setWarehouseCode(row.warehouseCode);
          setDescription(row.warehouseName);
        }}
      />
      <WarehouseTypePagedLookup
        open={lookupTypeOpen}
        onOpenChange={setLookupTypeOpen}
        onSelect={(row) => {
          setWhTypeCode(row.code);
          setWhTypeDesc(row.description);
        }}
      />
    </div>
  );
}

function WarehouseLocationLookup({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: WarehouseLocationRow) => void;
}) {
  type FieldKey = "warehouseName" | "warehouseCode";
  type MatchKey = "contains" | "equals" | "startsWith";
  const [field, setField] = useState<FieldKey>("warehouseName");
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
    if (!raw) return [...ALL_WAREHOUSE_LOCATIONS];
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
    return ALL_WAREHOUSE_LOCATIONS.filter((row) =>
      field === "warehouseName" ? test(row.warehouseName) : test(row.warehouseCode),
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
          <DialogTitle className="sr-only">Warehouse lookup</DialogTitle>
          <p className="text-base font-bold">Warehouse Location</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="space-y-2 rounded-md border-2 bg-muted/30 px-3 py-2.5">
            <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Criteria</div>
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="min-w-[10rem] space-y-1">
                <Label className="text-xs uppercase tracking-wide">Field</Label>
                <select value={field} onChange={(e) => setField(e.target.value as FieldKey)} className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium">
                  <option value="warehouseName">Description</option>
                  <option value="warehouseCode">WareHouse Code</option>
                </select>
              </div>
              <div className="min-w-[9rem] space-y-1">
                <Label className="text-xs uppercase tracking-wide">Match</Label>
                <select value={match} onChange={(e) => setMatch(e.target.value as MatchKey)} className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium">
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                </select>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" onClick={handleFind}>
                Find
              </Button>
              <label className="inline-flex min-h-[3rem] cursor-pointer items-center gap-2 shrink-0">
                <input type="checkbox" checked={autoSearch} onChange={(e) => setAutoSearch(e.target.checked)} className="h-5 w-5 rounded border-2 border-input accent-primary" />
                <span className="text-base font-semibold">Auto Search</span>
              </label>
            </div>
            <div className="pt-1">
              <Input value={filterText} onChange={(e) => setFilterText(e.target.value)} onKeyDown={(e) => !autoSearch && e.key === "Enter" && handleFind()} placeholder="Warehouse name or code…" className="h-11 max-w-xl text-base" />
            </div>
          </div>

          <LookupDialogResultScroll
            footer={
              rows.length > 0 ? (
                <LookupPaginationBar total={rows.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(sz) => { setPageSize(sz); setPage(0); }} />
              ) : null
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WareHouse Name</TableHead>
                  <TableHead className="w-[10rem]">WareHouse Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      No rows match.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row, idx) => {
                    const abs = sliceStart + idx;
                    return (
                      <TableRow
                        key={`${row.warehouseCode}\0${abs}`}
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
                        <TableCell className="py-3">{row.warehouseName}</TableCell>
                        <TableCell className="py-3 font-mono tabular-nums">{row.warehouseCode}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </LookupDialogResultScroll>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t-2 border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="mr-auto text-sm text-muted-foreground">{rows.length} row{rows.length === 1 ? "" : "s"}</p>
          <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
            <Button type="button" variant="outline" size="lg" className="min-w-[8rem]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" size="lg" className="min-w-[8rem]" onClick={handleApply} disabled={rows.length === 0}>
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WarehouseTypePagedLookup({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: CodeDescriptionRow) => void;
}) {
  type FieldKey = "description" | "code";
  type MatchKey = "contains" | "equals" | "startsWith";
  const [field, setField] = useState<FieldKey>("description");
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
    if (!raw) return [...ALL_WH_TYPES];
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
    return ALL_WH_TYPES.filter((row) => (field === "description" ? test(row.description) : test(row.code)));
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
          <DialogTitle className="sr-only">Warehouse type lookup</DialogTitle>
          <p className="text-base font-bold">Table of Warehouse Type</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="space-y-2 rounded-md border-2 bg-muted/30 px-3 py-2.5">
            <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Criteria</div>
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="min-w-[10rem] space-y-1">
                <Label className="text-xs uppercase tracking-wide">Field</Label>
                <select value={field} onChange={(e) => setField(e.target.value as FieldKey)} className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium">
                  <option value="description">Description</option>
                  <option value="code">Code</option>
                </select>
              </div>
              <div className="min-w-[9rem] space-y-1">
                <Label className="text-xs uppercase tracking-wide">Match</Label>
                <select value={match} onChange={(e) => setMatch(e.target.value as MatchKey)} className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium">
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                </select>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" onClick={handleFind}>
                Find
              </Button>
              <label className="inline-flex min-h-[3rem] cursor-pointer items-center gap-2 shrink-0">
                <input type="checkbox" checked={autoSearch} onChange={(e) => setAutoSearch(e.target.checked)} className="h-5 w-5 rounded border-2 border-input accent-primary" />
                <span className="text-base font-semibold">Auto Search</span>
              </label>
            </div>
            <div className="pt-1">
              <Input value={filterText} onChange={(e) => setFilterText(e.target.value)} onKeyDown={(e) => !autoSearch && e.key === "Enter" && handleFind()} placeholder="Type description or code…" className="h-11 max-w-xl text-base" />
            </div>
          </div>

          <LookupDialogResultScroll
            footer={
              rows.length > 0 ? (
                <LookupPaginationBar total={rows.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(sz) => { setPageSize(sz); setPage(0); }} />
              ) : null
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[8rem]">Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      No rows match.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row, idx) => {
                    const abs = sliceStart + idx;
                    return (
                      <TableRow
                        key={`${row.code}\0${abs}`}
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
                        <TableCell className="py-3">{row.description}</TableCell>
                        <TableCell className="py-3 font-mono tabular-nums">{row.code}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </LookupDialogResultScroll>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t-2 border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="mr-auto text-sm text-muted-foreground">{rows.length} row{rows.length === 1 ? "" : "s"}</p>
          <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
            <Button type="button" variant="outline" size="lg" className="min-w-[8rem]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" size="lg" className="min-w-[8rem]" onClick={handleApply} disabled={rows.length === 0}>
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
