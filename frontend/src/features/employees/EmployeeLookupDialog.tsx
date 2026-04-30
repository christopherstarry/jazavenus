import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { cn } from "#/lib/utils";
import {
  LOOKUP_DEFAULT_PAGE_SIZE,
  LOOKUP_DIALOG_CONTENT_CLASS,
  LOOKUP_DIALOG_SCROLL_BODY_CLASS,
  LookupDialogResultScroll,
  LookupPaginationBar,
} from "#/components/ui/lookup-dialog-chrome";
import { expandLookupDemoRows } from "#/lib/lookupDemoBulk";

const EMPLOYEE_LOOKUP_SEED = [
  { employeeName: "adminpas", employeeCode: "admin" },
  { employeeName: "DEDE GUMILAR", employeeCode: "DEDE G" },
  { employeeName: "dian mayasari", employeeCode: "dian" },
  { employeeName: "ismet", employeeCode: "ismet" },
  { employeeName: "MARIE", employeeCode: "MARIE" },
  { employeeName: "nindy natasha", employeeCode: "nindy" },
  { employeeName: "PAS", employeeCode: "PAS" },
  { employeeName: "PAY", employeeCode: "PAY" },
  { employeeName: "SUNAR", employeeCode: "SUNAR" },
  { employeeName: "usercirebon", employeeCode: "usercrb" },
  { employeeName: "wiwin", employeeCode: "wiwin" },
  { employeeName: "yuda", employeeCode: "yuda" },
] as const;

/** ~50 static rows — legacy names + generated POC lines for QA / pagination testing */
export const EMPLOYEE_LOOKUP_POC: readonly {
  employeeName: string;
  employeeCode: string;
}[] = expandLookupDemoRows(EMPLOYEE_LOOKUP_SEED, 50, (_gap, row) => ({
  employeeName: `Sample Staff ${String(row + 1).padStart(2, "0")}`,
  employeeCode: `USR${String(row + 1).padStart(3, "0")}`,
}));

type FieldKey = "employeeName" | "employeeCode";
type MatchKey = "contains" | "equals" | "startsWith";

interface EmployeeLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seed filter from the Main Information "Employee Name" field when the dialog opens. */
  initialHint?: string;
  onSelect: (row: { employeeName: string; employeeCode: string }) => void;
}

/**
 * Legacy-style employee picker: Criteria + table + OK / Cancel.
 * No API — static data for POC until the backend exists.
 */
export function EmployeeLookupDialog({
  open,
  onOpenChange,
  initialHint = "",
  onSelect,
}: EmployeeLookupDialogProps) {
  const [field, setField] = useState<FieldKey>("employeeName");
  const [match, setMatch] = useState<MatchKey>("contains");
  /** Live query from search box */
  const [filterText, setFilterText] = useState("");

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(LOOKUP_DEFAULT_PAGE_SIZE);

  /* When opening, seed both fields from parent name hint. */
  useEffect(() => {
    if (open) {
      const h = initialHint.trim();
      setFilterText(h);
      setSelectedIdx(0);
      setPage(0);
    }
  }, [open, initialHint]);

  const rows = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return [...EMPLOYEE_LOOKUP_POC];
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
    return EMPLOYEE_LOOKUP_POC.filter((row) =>
      field === "employeeName"
        ? test(row.employeeName)
        : test(row.employeeCode),
    );
  }, [filterText, match, field]);

  useEffect(() => {
    if (!open) return;
    setSelectedIdx(0);
    setPage(0);
  }, [filterText, field, match, open]);

  useEffect(() => {
    const pc = Math.max(1, Math.ceil(rows.length / pageSize));
    setPage((p) => Math.min(p, pc - 1));
  }, [rows.length, pageSize]);

  /* Keep highlighted row on the current page when paging. */
  useEffect(() => {
    if (rows.length === 0) return;
    const start = page * pageSize;
    const endEx = Math.min(rows.length, start + pageSize);
    setSelectedIdx((i) => {
      if (i >= start && i < endEx) return i;
      return Math.min(start, rows.length - 1);
    });
  }, [page, pageSize, rows.length]);

  /* Keep selection in range when filtering shrinks the list */
  useEffect(() => {
    if (selectedIdx >= rows.length) setSelectedIdx(Math.max(0, rows.length - 1));
  }, [rows.length, selectedIdx]);

  const handleApply = () => {
    const row = rows[selectedIdx];
    if (row) onSelect({ employeeName: row.employeeName, employeeCode: row.employeeCode });
    onOpenChange(false);
  };

  const sliceStart = page * pageSize;
  const pagedRows = rows.slice(sliceStart, sliceStart + pageSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={LOOKUP_DIALOG_CONTENT_CLASS}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="text-lg font-bold sr-only">Employee lookup</DialogTitle>
          <p className="text-base font-bold">Employee lookup</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
        {/* Criteria strip — mirrors legacy */}
        <div className="rounded-md border-2 bg-muted/30 px-4 py-3 space-y-3">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Criteria</div>
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="space-y-1.5 min-w-[8.5rem]">
              <Label htmlFor="lookup-field" className="text-xs uppercase tracking-wide">Field</Label>
              <select
                id="lookup-field"
                value={field}
                onChange={(e) => setField(e.target.value as FieldKey)}
                className="flex h-12 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
              >
                <option value="employeeName">EmplName</option>
                <option value="employeeCode">EmplCode</option>
              </select>
            </div>
            <div className="space-y-1.5 min-w-[8.5rem]">
              <Label htmlFor="lookup-match" className="text-xs uppercase tracking-wide">Match</Label>
              <select
                id="lookup-match"
                value={match}
                onChange={(e) => setMatch(e.target.value as MatchKey)}
                className="flex h-12 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="startsWith">Starts with</option>
              </select>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-12 shrink-0" disabled>
              Find
            </Button>
            <label className="inline-flex items-center gap-2 min-h-[3rem] cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked
                readOnly
                className="h-5 w-5 rounded border-2 border-input accent-primary"
              />
              <span className="font-semibold text-base">Auto Search</span>
            </label>
          </div>
          <div className="pt-1.5 space-y-1.5">
            <Label htmlFor="lookup-filter" className="sr-only">Search text</Label>
            <Input
              id="lookup-filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Type to narrow the list…"
              className="text-base max-w-xl h-12"
              aria-describedby="lookup-filter-help"
            />
            <p id="lookup-filter-help" className="text-xs text-muted-foreground">
              Filtering as you type.
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
                <TableHead>Employee Name</TableHead>
                <TableHead>Employee Code</TableHead>
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
                  const stableKey = `${row.employeeName}\0${row.employeeCode}`;
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
                        onSelect({ employeeName: row.employeeName, employeeCode: row.employeeCode });
                        onOpenChange(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedIdx(absoluteIdx);
                        }
                      }}
                    >
                      <TableCell className="font-medium py-4">{row.employeeName}</TableCell>
                      <TableCell className="tabular-nums py-4">{row.employeeCode}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </LookupDialogResultScroll>
        </div>

        <DialogFooter className="shrink-0 gap-3 sm:justify-between sm:items-center flex-col sm:flex-row pt-4 border-t-2 border-border">
          <p className="text-sm text-muted-foreground mr-auto">{rows.length} row{rows.length === 1 ? "" : "s"} total</p>
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
