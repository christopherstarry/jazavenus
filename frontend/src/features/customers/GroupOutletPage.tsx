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

type GroupOutletRow = {
  groupOutletType: string;
  description: string;
};

const GROUP_OUTLET_SEED = [
  { groupOutletType: "A", description: "YOGYA GROUP" },
  { groupOutletType: "B", description: "BORMA GROUP" },
  { groupOutletType: "E", description: "CARET GROUP" },
  { groupOutletType: "D", description: "GREAT GROUP" },
  { groupOutletType: "H", description: "LOTTE GROUP" },
  { groupOutletType: "C", description: "MAHATAR GROUP" },
  { groupOutletType: "G", description: "SAT GROUP" },
  { groupOutletType: "I", description: "SELAMAT GROUP" },
  { groupOutletType: "F", description: "SUNDE GROUP" },
] as const;

const GROUP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Seeded list + generated rows (~50) for pagination testing */
const GROUP_OUTLET_POC: GroupOutletRow[] = expandLookupDemoRows(GROUP_OUTLET_SEED, 50, (_, row) => ({
  groupOutletType: GROUP_LETTERS.charAt((row + 9) % 26),
  description: `DEMO OUTLET GROUP ${String(row + 1).padStart(2, "0")} — QA sample`,
}));

export function GroupOutletPage() {
  const [groupOutletType, setGroupOutletType] = useState("");
  const [description, setDescription] = useState("");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Group Outlet Type</h2>

        <div className="grid gap-4 md:grid-cols-2 items-start">
          <div className="space-y-2">
            <Label htmlFor="group-outlet-type">Group Outlet Type</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="group-outlet-type"
                value={groupOutletType}
                onChange={(e) => setGroupOutletType(e.target.value)}
                placeholder="A"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Open group outlet list"
                onClick={() => setLookupOpen(true)}
                className="shrink-0 h-12 w-12"
              >
                <MoreHorizontal className="h-5 w-5" aria-hidden />
                <span className="sr-only">Lookup list</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-outlet-description">Description</Label>
            <Input
              id="group-outlet-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="YOGYA GROUP"
            />
          </div>
        </div>
      </div>

      <GroupOutletLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          setGroupOutletType(row.groupOutletType);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

type FieldKey = "description" | "groupOutletType";
type MatchKey = "contains" | "equals" | "startsWith";

function GroupOutletLookupDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: GroupOutletRow) => void;
}) {
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
    const q = appliedQuery.trim().toLowerCase();
    if (!q) return [...GROUP_OUTLET_POC];

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

    return GROUP_OUTLET_POC.filter((row) =>
      field === "description" ? test(row.description) : test(row.groupOutletType),
    );
  }, [appliedQuery, match, field]);

  /* New field/match = new result set */
  useEffect(() => {
    setPage(0);
    setSelectedIdx(0);
  }, [field, match]);

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
          <DialogTitle className="text-base font-bold sr-only">Group outlet lookup</DialogTitle>
          <p className="text-base font-bold">Table Group Outlet</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
        <div className="rounded-md border-2 bg-muted/30 px-3 py-2.5 space-y-2">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Criteria</div>
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div className="space-y-1 min-w-[8.5rem]">
              <Label htmlFor="group-outlet-field" className="text-xs uppercase tracking-wide">Field</Label>
              <select
                id="group-outlet-field"
                value={field}
                onChange={(e) => setField(e.target.value as FieldKey)}
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
              >
                <option value="description">Description</option>
                <option value="groupOutletType">Group Outlet Type</option>
              </select>
            </div>

            <div className="space-y-1 min-w-[8.5rem]">
              <Label htmlFor="group-outlet-match" className="text-xs uppercase tracking-wide">Match</Label>
              <select
                id="group-outlet-match"
                value={match}
                onChange={(e) => setMatch(e.target.value as MatchKey)}
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="startsWith">Starts with</option>
              </select>
            </div>

            <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" onClick={handleFind}>
              Find
            </Button>

            <label className="inline-flex items-center gap-2 min-h-[3rem] cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSearch}
                onChange={(e) => setAutoSearch(e.target.checked)}
                className="h-5 w-5 rounded border-2 border-input accent-primary"
              />
              <span className="font-semibold text-base">Auto Search</span>
            </label>
          </div>

          <div className="pt-1">
            <Label htmlFor="group-outlet-filter" className="sr-only">Search text</Label>
            <Input
              id="group-outlet-filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyDown={(e) => {
                if (!autoSearch && e.key === "Enter") handleFind();
              }}
              placeholder="Type to narrow the list…"
              className="text-base max-w-xl h-11"
              aria-describedby="group-outlet-filter-help"
            />
            <p id="group-outlet-filter-help" className="text-xs text-muted-foreground mt-1">
              {autoSearch ? "Filtering as you type." : 'Press Enter after typing or click "Find".'}
            </p>
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
                <TableHead>Description</TableHead>
                <TableHead>Group Outlet Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    No rows match. Change criteria or search text.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row, idx) => {
                  const stableKey = `${row.groupOutletType}\0${row.description}`;
                  const absoluteIdx = sliceStart + idx;
                  return (
                    <TableRow
                      key={stableKey}
                      data-state={selectedIdx === absoluteIdx ? "selected" : undefined}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "cursor-pointer",
                        selectedIdx === absoluteIdx && "bg-accent",
                      )}
                      onClick={() => setSelectedIdx(absoluteIdx)}
                      onDoubleClick={() => {
                        onSelect(row);
                        onOpenChange(false);
                      }}
                    >
                      <TableCell className="py-3">{row.description}</TableCell>
                      <TableCell className="py-3 tabular-nums">{row.groupOutletType}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </LookupDialogResultScroll>

        </div>

        <DialogFooter className="shrink-0 gap-3 sm:justify-between sm:items-center flex-col sm:flex-row pt-4 border-t-2 border-border">
          <p className="text-sm text-muted-foreground mr-auto">
            {rows.length} row{rows.length === 1 ? "" : "s"} total
          </p>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
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

