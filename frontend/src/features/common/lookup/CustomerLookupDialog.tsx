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

type MatchKey = "contains" | "equals" | "startsWith";
type FieldKey = string;

export type LookupField<T> = {
  id: FieldKey;
  label: string;
  getValue: (row: T) => string;
};

export type LookupColumn<T> = {
  header: string;
  getValue: (row: T) => string;
  align?: "left" | "center" | "right";
  className?: string;
};

export type CustomerLookupDialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  initialHint?: string;

  rows: readonly T[];
  fields: readonly [LookupField<T>, ...LookupField<T>[]];
  columns: readonly LookupColumn<T>[];
  defaultFieldId: FieldKey;

  onSelect: (row: T) => void;
};

export function CustomerLookupDialog<T>({
  open,
  onOpenChange,
  title,
  initialHint = "",
  rows,
  fields,
  columns,
  defaultFieldId,
  onSelect,
}: CustomerLookupDialogProps<T>) {
  const [fieldId, setFieldId] = useState<FieldKey>(defaultFieldId);
  const [match, setMatch] = useState<MatchKey>("contains");
  const [autoSearch, setAutoSearch] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(LOOKUP_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (!open) return;
    setFilterText(initialHint.trim());
    setAppliedQuery(initialHint.trim());
    setFieldId(defaultFieldId);
    setMatch("contains");
    setAutoSearch(true);
    setSelectedIdx(0);
    setPage(0);
  }, [open, initialHint, defaultFieldId]);

  useEffect(() => {
    if (!open || !autoSearch) return;
    setAppliedQuery(filterText);
    setPage(0);
    setSelectedIdx(0);
  }, [filterText, autoSearch, open]);

  const activeField = useMemo(
    () => fields.find((f) => f.id === fieldId) ?? fields[0],
    [fields, fieldId],
  );

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    if (!q) return [...rows];

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

    return rows.filter((row) => test(activeField.getValue(row)));
  }, [rows, appliedQuery, match, activeField]);

  useEffect(() => {
    if (!open) return;
    setPage(0);
    setSelectedIdx(0);
  }, [match, fieldId, open]);

  useEffect(() => {
    const pc = Math.max(1, Math.ceil(filtered.length / pageSize));
    setPage((p) => Math.min(p, pc - 1));
  }, [filtered.length, pageSize]);

  useEffect(() => {
    if (filtered.length === 0) return;
    const start = page * pageSize;
    const endEx = Math.min(filtered.length, start + pageSize);
    setSelectedIdx((i) => {
      if (i >= start && i < endEx) return i;
      return Math.min(start, filtered.length - 1);
    });
  }, [page, pageSize, filtered.length]);

  useEffect(() => {
    if (selectedIdx >= filtered.length) setSelectedIdx(Math.max(0, filtered.length - 1));
  }, [filtered.length, selectedIdx]);

  const handleFind = () => {
    setAppliedQuery(filterText);
    setSelectedIdx(0);
    setPage(0);
  };

  const handleApply = () => {
    const row = filtered[selectedIdx];
    if (!row) return;
    onSelect(row);
    onOpenChange(false);
  };

  const sliceStart = page * pageSize;
  const pagedRows = filtered.slice(sliceStart, sliceStart + pageSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={LOOKUP_DIALOG_CONTENT_CLASS}>
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="text-base font-bold sr-only">{title}</DialogTitle>
          <p className="text-base font-bold">{title}</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
        <div className="rounded-md border-2 bg-muted/30 px-4 py-3 space-y-2">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Criteria</div>
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="space-y-1.5 min-w-[8.5rem]">
              <Label className="text-xs uppercase tracking-wide">Field</Label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 min-w-[8.5rem]">
              <Label className="text-xs uppercase tracking-wide">Match</Label>
              <select
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
            <label className="inline-flex items-center gap-2 min-h-[2.75rem] cursor-pointer shrink-0">
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
            <Label className="sr-only">Search text</Label>
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyDown={(e) => {
                if (!autoSearch && e.key === "Enter") handleFind();
              }}
              placeholder="Type to narrow the list…"
              className="text-base h-11 max-w-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">{autoSearch ? "Filtering as you type." : 'Press Enter or click "Find".'}</p>
          </div>
        </div>

        <LookupDialogResultScroll
          footer={
            filtered.length > 0 ? (
              <LookupPaginationBar
                total={filtered.length}
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
                {columns.map((c) => (
                  <TableHead key={c.header}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-6">
                    No rows match. Change criteria or search text.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row, idx) => {
                  const stableKey = columns.map((c) => c.getValue(row)).join("|");
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
                        onSelect(row);
                        onOpenChange(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedIdx(absoluteIdx);
                        }
                      }}
                    >
                      {columns.map((c) => (
                        <TableCell
                          key={c.header}
                          className={cn(
                            c.className,
                            c.align === "center" && "text-center",
                            c.align === "right" && "text-right",
                            c.align === "left" && "text-left",
                          )}
                        >
                          {c.getValue(row)}
                        </TableCell>
                      ))}
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
            {filtered.length} row{filtered.length === 1 ? "" : "s"} total
          </p>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" size="lg" className="min-w-[8rem]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" size="lg" className="min-w-[8rem]" onClick={handleApply} disabled={filtered.length === 0}>
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

