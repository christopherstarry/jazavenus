import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { cn } from "#/lib/utils";
import { expandLookupDemoRows } from "#/lib/lookupDemoBulk";
import {
  LOOKUP_DEFAULT_PAGE_SIZE,
  LOOKUP_DIALOG_CONTENT_CLASS,
  LOOKUP_DIALOG_SCROLL_BODY_CLASS,
  LookupDialogResultScroll,
  LookupPaginationBar,
} from "#/components/ui/lookup-dialog-chrome";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

const CLASS_OUTLET_SEED = [
  { groupOutlet: "04", description: "< 250.000" },
  { groupOutlet: "01", description: ">= 1 JT  - < 5 JT" },
  { groupOutlet: "03", description: ">= 250.000 - < 500.000" },
  { groupOutlet: "02", description: ">= 500.000 - < 1 JT" },
] as const;

/** Seeded POC + generated lines to exercise pagination (~50 rows). */
const CLASS_OUTLET_POC = expandLookupDemoRows(CLASS_OUTLET_SEED, 50, (_, row) => ({
  groupOutlet: `${String((row % 89) + 10).padStart(2, "0")}`,
  description: `POC Tier ${String(row + 1).padStart(2, "0")} — demo class band QA`,
}));

export function ClassOutletPage() {
  const [groupOutlet, setGroupOutlet] = useState("");
  const [description, setDescription] = useState("");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Class Outlet</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="class-outlet-code">Group Outlet</Label>
            <div className="flex gap-2 max-w-sm">
              <Input
                id="class-outlet-code"
                value={groupOutlet}
                onChange={(e) => setGroupOutlet(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={() => setLookupOpen(true)}
                title="Open class outlet list"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Open list</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-outlet-description">Description</Label>
            <Input
              id="class-outlet-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outlet class description"
            />
          </div>
        </div>
      </div>

      <ClassOutletLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          setGroupOutlet(row.groupOutlet);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

function ClassOutletLookupDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: { groupOutlet: string; description: string }) => void;
}) {
  const [filterText, setFilterText] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(LOOKUP_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (open) {
      setFilterText("");
      setSelectedIdx(0);
      setPage(0);
    }
  }, [open]);

  const rows = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return [...CLASS_OUTLET_POC];
    return CLASS_OUTLET_POC.filter((row) => row.description.toLowerCase().includes(q));
  }, [filterText]);

  useEffect(() => {
    if (!open) return;
    setSelectedIdx(0);
    setPage(0);
  }, [filterText, open]);

  useEffect(() => {
    const pc = Math.max(1, Math.ceil(rows.length / pageSize));
    setPage((p) => Math.min(p, pc - 1));
  }, [rows.length, pageSize]);

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

  const sliceStart = page * pageSize;
  const pagedRows = rows.slice(sliceStart, sliceStart + pageSize);

  const applySelection = () => {
    const row = rows[selectedIdx];
    if (row) onSelect({ groupOutlet: row.groupOutlet, description: row.description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={LOOKUP_DIALOG_CONTENT_CLASS}>
        <DialogHeader className="shrink-0 pb-2 pr-10">
          <DialogTitle className="text-base font-bold sr-only">Class outlet lookup</DialogTitle>
          <p className="text-base font-bold">Table of Class Outlet</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
        <div className="rounded-md border-2 bg-muted/30 px-4 py-3 space-y-3">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Criteria</div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 min-w-[9rem]">
              <Label className="text-xs uppercase tracking-wide">Field</Label>
              <select
                disabled
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium opacity-80"
              >
                <option>Description</option>
              </select>
            </div>
            <div className="space-y-1.5 min-w-[9rem]">
              <Label className="text-xs uppercase tracking-wide">Match</Label>
              <select
                disabled
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium opacity-80"
              >
                <option>Contains</option>
              </select>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-11" disabled>
              Find
            </Button>
            <label className="inline-flex items-center gap-2 min-h-[2.75rem]">
              <input type="checkbox" checked readOnly className="h-5 w-5 rounded border-2 border-input accent-primary" />
              <span className="font-semibold text-base">Auto Search</span>
            </label>
          </div>
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Type to narrow the list..."
            className="h-11"
          />
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
                <TableHead>Description</TableHead>
                <TableHead>Group Outlet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.map((row, idx) => {
                const stableKey = `${row.groupOutlet}\0${row.description}`;
                const absoluteIdx = sliceStart + idx;
                return (
                  <TableRow
                    key={stableKey}
                    data-state={selectedIdx === absoluteIdx ? "selected" : undefined}
                    role="button"
                    tabIndex={0}
                    className={cn("cursor-pointer", selectedIdx === absoluteIdx && "bg-accent")}
                    onClick={() => setSelectedIdx(absoluteIdx)}
                    onDoubleClick={() => {
                      onSelect({ groupOutlet: row.groupOutlet, description: row.description });
                      onOpenChange(false);
                    }}
                  >
                    <TableCell className="py-3">{row.description}</TableCell>
                    <TableCell className="py-3 tabular-nums">{row.groupOutlet}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </LookupDialogResultScroll>

        </div>

        <DialogFooter className="shrink-0 gap-3 sm:justify-between sm:items-center flex-col sm:flex-row pt-4 border-t-2 border-border">
          <p className="text-sm text-muted-foreground mr-auto">
            {rows.length} row{rows.length === 1 ? "" : "s"} total
          </p>
          <Button type="button" variant="outline" size="lg" className="min-w-[8rem]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="lg" className="min-w-[8rem]" onClick={applySelection} disabled={rows.length === 0}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
