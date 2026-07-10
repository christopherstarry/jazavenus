import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { api } from "#/lib/api";
import { cn } from "#/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import {
  LOOKUP_DEFAULT_PAGE_SIZE,
  LOOKUP_DIALOG_CONTENT_CLASS,
  LOOKUP_DIALOG_SCROLL_BODY_CLASS,
  LookupDialogResultScroll,
  LookupPaginationBar,
} from "#/components/ui/lookup-dialog-chrome";

/**
 * Lookup types wired to `GET /api/lookup/{type}` (`Jaza.Infrastructure.Lookup.LookupService`).
 * Matches the ~40 types enumerated in docs/modules/shared/ui-foundation/lookup-browse-dialog.md.
 */
export type LookupType =
  | "customers" | "suppliers" | "items" | "warehouses" | "brands" | "categories" | "sub-categories"
  | "units" | "banks" | "salesmen" | "collectors" | "areas" | "payment-terms"
  | "order-codes" | "return-codes" | "purchase-orders" | "sales-orders"
  | "delivery-orders" | "invoices" | "payments" | "sales-returns"
  | "purchase-returns" | "credit-memos" | "post-dated-checks"
  | "stock-receipts" | "stock-issues" | "stock-transfers"
  | "customer-addresses" | "fiscal-periods" | "extra-discounts"
  | "tax-registrations" | "price-tiers" | "discount-codes" | "grns" | "ar-adjustments";

export interface LookupItem {
  id: string | null;
  code: string;
  name: string;
  extra?: string | null;
}

interface LookupResultDto {
  type: string;
  items: LookupItem[];
  totalCount: number;
}

export interface LookupDialogProps {
  type: LookupType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: LookupItem) => void;
  /** Optional parent-scoped filter (e.g. customerId for customer-addresses) — reserved for callers. */
  division?: string;
  title?: string;
}

/**
 * Universal Browse/Lookup popup — matches legacy `frmBrowse`. One instance is reused across every
 * FK code field on gap screens (transactions, A/R, inventory, master-data, reports). Triggered by a
 * magnifier button or F4. See docs/modules/shared/ui-foundation/lookup-browse-dialog.md.
 *
 * Note: the backend searches code+name together (no per-field selector); the "condition" toggle
 * mirrors legacy chrome but only "contains" is server-evaluated — "startsWith" narrows client-side
 * within the fetched page.
 */
export function LookupDialog({ type, open, onOpenChange, onSelect, division, title }: LookupDialogProps) {
  const { t } = useTranslation(["lookup", "common"]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [condition, setCondition] = useState<"contains" | "startsWith">("contains");
  const [autoSearch, setAutoSearch] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LOOKUP_DEFAULT_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setAppliedSearch("");
    setCondition("contains");
    setAutoSearch(true);
    setPage(1);
    setSelectedId(null);
  }, [open, type]);

  useEffect(() => {
    if (!open || !autoSearch) return;
    const handle = setTimeout(() => {
      setAppliedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, autoSearch, open]);

  const query = useQuery({
    queryKey: ["lookup", type, appliedSearch, division, page, pageSize],
    queryFn: () =>
      api
        .get(`lookup/${type}`, {
          searchParams: {
            search: appliedSearch,
            page,
            pageSize,
            ...(division ? { division } : {}),
          },
        })
        .json<LookupResultDto>(),
    enabled: open,
    placeholderData: (prev) => prev,
  });

  const rows = query.data?.items ?? [];
  const filteredRows =
    condition === "startsWith" && appliedSearch.trim()
      ? rows.filter(
          (r) =>
            r.code.toLowerCase().startsWith(appliedSearch.trim().toLowerCase()) ||
            r.name.toLowerCase().startsWith(appliedSearch.trim().toLowerCase()),
        )
      : rows;
  const total = condition === "startsWith" && appliedSearch.trim() ? filteredRows.length : (query.data?.totalCount ?? 0);

  const handleFind = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleSelect = (item: LookupItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  const dialogTitle = title ?? t(`lookup.title.${type}`, { defaultValue: t("lookup.titleFallback") });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={LOOKUP_DIALOG_CONTENT_CLASS}>
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="text-base font-bold">{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="rounded-md border-2 bg-muted/30 px-4 py-3 space-y-2">
            <div className="flex flex-wrap items-end gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-[8.5rem]">
                <Label className="text-xs uppercase tracking-wide">{t("lookup.field")}</Label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as "contains" | "startsWith")}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="contains">{t("lookup.condition.contains")}</option>
                  <option value="startsWith">{t("lookup.condition.startsWith")}</option>
                </select>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" onClick={handleFind}>
                {t("lookup.find")}
              </Button>
              <label className="inline-flex items-center gap-2 min-h-[2.75rem] cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={autoSearch}
                  onChange={(e) => setAutoSearch(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-input accent-primary"
                />
                <span className="font-semibold text-base">{t("lookup.autoSearch")}</span>
              </label>
              {query.isFetching && <RotateCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="pt-1">
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (!autoSearch && e.key === "Enter") handleFind();
                }}
                placeholder={t("lookup.searchPlaceholder")}
                className="text-base h-11 max-w-xl"
              />
            </div>
          </div>

          <LookupDialogResultScroll
            footer={
              total > 0 ? (
                <LookupPaginationBar
                  total={total}
                  page={page - 1}
                  pageSize={pageSize}
                  onPageChange={(p) => setPage(p + 1)}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz);
                    setPage(1);
                  }}
                />
              ) : null
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("lookup.columnCode")}</TableHead>
                  <TableHead>{t("lookup.columnName")}</TableHead>
                  <TableHead>{t("lookup.columnExtra")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isError ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      <p className="text-destructive mb-2">{t("lookup.loadError")}</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => query.refetch()}>
                        {t("lookup.retry")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      {query.isLoading ? t("common:loading") : t("lookup.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => {
                    const rowKey = row.id ?? row.code;
                    const isSelected = selectedId === rowKey;
                    return (
                      <TableRow
                        key={rowKey}
                        data-state={isSelected ? "selected" : undefined}
                        role="button"
                        tabIndex={0}
                        className={cn("cursor-pointer", isSelected && "bg-accent")}
                        onClick={() => setSelectedId(rowKey)}
                        onDoubleClick={() => handleSelect(row)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (isSelected) handleSelect(row);
                            else setSelectedId(rowKey);
                          }
                        }}
                      >
                        <TableCell className="font-mono">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.extra ?? ""}</TableCell>
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
            {total} row{total === 1 ? "" : "s"} total
          </p>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" size="lg" className="min-w-[8rem]" onClick={() => onOpenChange(false)}>
              {t("lookup.cancel")}
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-w-[8rem]"
              disabled={!selectedId}
              onClick={() => {
                const row = filteredRows.find((r) => (r.id ?? r.code) === selectedId);
                if (row) handleSelect(row);
              }}
            >
              {t("lookup.select")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
