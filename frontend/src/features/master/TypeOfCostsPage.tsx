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

export type CostTypeRow = { description: string; manufacturingCode: string };

/** Screenshot-aligned sample rows plus generated rows — list only appears in the lookup dialog */

function buildDemoCostTypes(): CostTypeRow[] {
  const known: CostTypeRow[] = [
    { description: "tes", manufacturingCode: "" },

    { description: "TES AJA", manufacturingCode: "03" },

    { description: "TES1", manufacturingCode: "01" },

    { description: "TES2", manufacturingCode: "02" },
  ];

  const rest: CostTypeRow[] = [];

  for (let i = 5; i <= 48; i++) {
    const code = String(i).padStart(2, "0");

    rest.push({ description: `Cost type ${code}`, manufacturingCode: code });
  }

  return [...known, ...rest];
}

const ALL_COST_TYPES: CostTypeRow[] = buildDemoCostTypes();

const DEMO_HEADERS: CostTypeRow[] = [ALL_COST_TYPES[0]!, ALL_COST_TYPES[1]!, ALL_COST_TYPES[2]!];

export function TypeOfCostsPage() {
  const navigate = useNavigate();

  const [recordIdx, setRecordIdx] = useState(0);

  const [costCode, setCostCode] = useState(DEMO_HEADERS[0]!.manufacturingCode);

  const [description, setDescription] = useState(DEMO_HEADERS[0]!.description);

  const [lookupOpen, setLookupOpen] = useState(false);

  const applyHeader = useCallback((row: CostTypeRow) => {
    setCostCode(row.manufacturingCode);

    setDescription(row.description);
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
          className="h-11 shrink-0"
          title="New"
          onClick={() => cycleRecord(recordIdx)}
        >
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 shrink-0 border-primary/60"
          title="Execute"
        >
          <Check className="h-4 w-4 text-emerald-600" />

          <span className="ml-2 hidden font-semibold md:inline">Exec</span>
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 text-destructive hover:text-destructive"
          title="Close"
          onClick={() => navigate(-1)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <LegacyDivisionFormNav
        onPreviousForm={() => cycleRecord(recordIdx - 1)}
        onNextForm={() => cycleRecord(recordIdx + 1)}
      />

      <div className="space-y-4 rounded-md border-2 border-border bg-card p-4">
        <h2 className="text-xl font-bold tracking-tight">:: Costs Of Type</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-4">
            <Label htmlFor="cost-code">Cost Code</Label>

            <div className="flex gap-2">
              <Input
                id="cost-code"
                value={costCode}
                onChange={(e) => setCostCode(e.target.value)}
                className="max-w-[10rem] font-mono tabular-nums"
                autoComplete="off"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0"
                title="Open lookup"
                onClick={() => setLookupOpen(true)}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-8">
            <Label htmlFor="cost-desc">Description</Label>

            <Input
              id="cost-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        POC: sample cost types · open lookup (⋯) for the searchable grid (Description +
        Manufacturing Code).
      </p>

      <CostTypeLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          applyHeader(row);
        }}
      />
    </div>
  );
}

type FieldKey = "description" | "manufacturingCode";

type MatchKey = "contains" | "equals" | "startsWith";

function CostTypeLookupDialog({
  open,

  onOpenChange,

  onSelect,
}: {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  onSelect: (row: CostTypeRow) => void;
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
    const raw = appliedQuery.trim();

    if (!raw) return [...ALL_COST_TYPES];

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

    return ALL_COST_TYPES.filter((row) =>
      field === "description" ? test(row.description) : test(row.manufacturingCode)
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
          <DialogTitle className="sr-only">Type of costs lookup</DialogTitle>

          <p className="text-base font-bold">Type Of Costs</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="space-y-2 rounded-md border-2 bg-muted/30 px-3 py-2.5">
            <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Criteria
            </div>

            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="ct-field" className="text-xs uppercase tracking-wide">
                  Field
                </Label>

                <select
                  id="ct-field"
                  value={field}
                  onChange={(e) => setField(e.target.value as FieldKey)}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="description">Description</option>

                  <option value="manufacturingCode">Manufacturing Code</option>
                </select>
              </div>

              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="ct-match" className="text-xs uppercase tracking-wide">
                  Match
                </Label>

                <select
                  id="ct-match"
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
              <Label htmlFor="ct-filter" className="sr-only">
                Search
              </Label>

              <Input
                id="ct-filter"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => {
                  if (!autoSearch && e.key === "Enter") handleFind();
                }}
                placeholder="Type description or manufacturing code…"
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
                  <TableHead>Description</TableHead>

                  <TableHead className="w-[10rem]">Manufacturing Code</TableHead>
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
                        key={`${row.description}\0${row.manufacturingCode}\0${abs}`}
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

                        <TableCell className="py-3 font-mono tabular-nums">
                          {row.manufacturingCode || "\u2014"}
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
