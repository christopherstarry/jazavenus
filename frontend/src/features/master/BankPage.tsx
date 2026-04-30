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

export type BankRow = { bankName: string; bankCode: string };

/** Screenshot-style banks + extras — grid only in lookup */

function buildDemoBanks(): BankRow[] {
  const known: BankRow[] = [
    { bankName: "BANK NUSANTARA PARAHYANGAN", bankCode: "001" },
    { bankName: "BANK ARTOS", bankCode: "035" },
    { bankName: "Bank BNI", bankCode: "014" },
    { bankName: "Bank BTN", bankCode: "013" },
    { bankName: "Bank Central Asia", bankCode: "024" },
    { bankName: "Bank Danamon", bankCode: "005" },
  ];
  const rest: BankRow[] = [];
  for (let i = 7; i <= 52; i++) {
    const code = String(i).padStart(3, "0");
    rest.push({ bankName: `Demo Bank ${code}`, bankCode: code });
  }
  return [...known, ...rest];
}

const ALL_BANKS: BankRow[] = buildDemoBanks();

const DEMO_HEADERS: BankRow[] = [ALL_BANKS[0]!, ALL_BANKS[1]!, ALL_BANKS[2]!];

export function BankPage() {
  const navigate = useNavigate();

  const [recordIdx, setRecordIdx] = useState(0);

  const [bankCode, setBankCode] = useState(DEMO_HEADERS[0]!.bankCode);

  const [bankName, setBankName] = useState(DEMO_HEADERS[0]!.bankName);

  const [lookupOpen, setLookupOpen] = useState(false);

  const applyHeader = useCallback((row: BankRow) => {
    setBankCode(row.bankCode);

    setBankName(row.bankName);
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
        <h2 className="text-xl font-bold tracking-tight">:: Bank</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-4">
            <Label htmlFor="bank-code">Bank Code</Label>

            <div className="flex gap-2">
              <Input
                id="bank-code"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
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
            <Label htmlFor="bank-name">Bank Name</Label>

            <Input
              id="bank-name"
              readOnly
              tabIndex={-1}
              value={bankName}
              className="cursor-default bg-muted/50"
              aria-readonly="true"
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        POC: sample banks · open lookup (⋯) for the searchable grid (BankName + BankCode).
      </p>

      <BankLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          applyHeader(row);
        }}
      />
    </div>
  );
}

type FieldKey = "bankName" | "bankCode";

type MatchKey = "contains" | "equals" | "startsWith";

function BankLookupDialog({
  open,

  onOpenChange,

  onSelect,
}: {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  onSelect: (row: BankRow) => void;
}) {
  const [field, setField] = useState<FieldKey>("bankName");

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

    if (!raw) return [...ALL_BANKS];

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

    return ALL_BANKS.filter((row) =>
      field === "bankName" ? test(row.bankName) : test(row.bankCode)
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
          <DialogTitle className="sr-only">Bank lookup</DialogTitle>

          <p className="text-base font-bold">Bank</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="space-y-2 rounded-md border-2 bg-muted/30 px-3 py-2.5">
            <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Criteria
            </div>

            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="bk-field" className="text-xs uppercase tracking-wide">
                  Field
                </Label>

                <select
                  id="bk-field"
                  value={field}
                  onChange={(e) => setField(e.target.value as FieldKey)}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="bankName">BankName</option>

                  <option value="bankCode">BankCode</option>
                </select>
              </div>

              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="bk-match" className="text-xs uppercase tracking-wide">
                  Match
                </Label>

                <select
                  id="bk-match"
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
              <Label htmlFor="bk-filter" className="sr-only">
                Search
              </Label>

              <Input
                id="bk-filter"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => {
                  if (!autoSearch && e.key === "Enter") handleFind();
                }}
                placeholder="Type bank name or bank code…"
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
                  <TableHead>BankName</TableHead>

                  <TableHead className="w-[10rem]">BankCode</TableHead>
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
                        key={`${row.bankCode}\0${row.bankName}\0${abs}`}
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
                        <TableCell className="py-3">{row.bankName}</TableCell>

                        <TableCell className="py-3 font-mono tabular-nums">
                          {row.bankCode}
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
