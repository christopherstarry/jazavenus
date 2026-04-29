import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/** Static POC payload — matches the legacy VB lookup list (from user screenshot). */
export const EMPLOYEE_LOOKUP_POC = [
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

  /* When opening, seed both fields from parent name hint. */
  useEffect(() => {
    if (open) {
      const h = initialHint.trim();
      setFilterText(h);
      setSelectedIdx(0);
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
  }, [filterText, field, match, open]);

  /* Keep selection in range when filtering shrinks the list */
  useEffect(() => {
    if (selectedIdx >= rows.length) setSelectedIdx(Math.max(0, rows.length - 1));
  }, [rows.length, selectedIdx]);

  const handleApply = () => {
    const row = rows[selectedIdx];
    if (row) onSelect({ employeeName: row.employeeName, employeeCode: row.employeeCode });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(100vw-1.5rem,42rem)] p-4 sm:p-5 gap-0 border-2 max-h-[min(92vh,40rem)] flex flex-col overflow-hidden [&>button]:top-3 [&>button]:right-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="text-lg font-bold sr-only">Employee lookup</DialogTitle>
          <p className="text-base font-bold">Employee lookup</p>
        </DialogHeader>

        {/* Criteria strip — mirrors legacy */}
        <div className="shrink-0 rounded-md border-2 bg-muted/30 px-4 py-3 space-y-3">
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

        {/* Result table — height-capped so the dialog never leaves a giant empty gap */}
        <div className="min-h-0 flex-1 flex flex-col border-2 rounded-md overflow-hidden mt-3 border-border">
          <div className="overflow-auto max-h-[min(52vh,18rem)] sm:max-h-[min(52vh,20rem)]">
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
                  rows.map((row, idx) => {
                    const stableKey = `${row.employeeName}\0${row.employeeCode}`;
                    return (
                      <TableRow
                        key={stableKey}
                        data-state={selectedIdx === idx ? "selected" : undefined}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "cursor-pointer",
                          selectedIdx === idx && "bg-accent",
                        )}
                        onClick={() => setSelectedIdx(idx)}
                        onDoubleClick={() => {
                          onSelect({ employeeName: row.employeeName, employeeCode: row.employeeCode });
                          onOpenChange(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedIdx(idx);
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
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-3 sm:justify-between sm:items-center flex-col sm:flex-row pt-4 border-t-2 mt-3">
          <p className="text-sm text-muted-foreground mr-auto">{rows.length} row{rows.length === 1 ? "" : "s"}</p>
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
