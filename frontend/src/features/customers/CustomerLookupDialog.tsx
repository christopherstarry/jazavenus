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

  useEffect(() => {
    if (!open) return;
    setFilterText(initialHint.trim());
    setAppliedQuery(initialHint.trim());
    setFieldId(defaultFieldId);
    setMatch("contains");
    setAutoSearch(true);
    setSelectedIdx(0);
  }, [open, initialHint, defaultFieldId]);

  useEffect(() => {
    if (!open || !autoSearch) return;
    setAppliedQuery(filterText);
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
    if (selectedIdx >= filtered.length) setSelectedIdx(Math.max(0, filtered.length - 1));
  }, [filtered.length, selectedIdx]);

  const handleFind = () => {
    setAppliedQuery(filterText);
    setSelectedIdx(0);
  };

  const handleApply = () => {
    const row = filtered[selectedIdx];
    if (!row) return;
    onSelect(row);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-1.5rem,42rem)] p-4 sm:p-5 gap-0 border-2 max-h-[min(92vh,38rem)] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="text-base font-bold sr-only">{title}</DialogTitle>
          <p className="text-base font-bold">{title}</p>
        </DialogHeader>

        <div className="shrink-0 rounded-md border-2 bg-muted/30 px-4 py-3 space-y-2">
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

        <div className="min-h-0 flex-1 flex flex-col border-2 rounded-md overflow-hidden mt-3 border-border">
          <div className="overflow-auto max-h-[min(52vh,18rem)]">
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
                  filtered.map((row, idx) => {
                    const stableKey = columns.map((c) => c.getValue(row)).join("|");
                    return (
                      <TableRow
                        key={stableKey}
                        data-state={selectedIdx === idx ? "selected" : undefined}
                        role="button"
                        tabIndex={0}
                        className={cn("cursor-pointer", selectedIdx === idx && "bg-accent")}
                        onClick={() => setSelectedIdx(idx)}
                        onDoubleClick={() => {
                          onSelect(row);
                          onOpenChange(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedIdx(idx);
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
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-3 sm:justify-between sm:items-center flex-col sm:flex-row pt-4 border-t-2 mt-3">
          <p className="text-sm text-muted-foreground mr-auto">
            {filtered.length} row{filtered.length === 1 ? "" : "s"}
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

