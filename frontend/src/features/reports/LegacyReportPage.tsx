import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { api } from "#/lib/api";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Card, CardContent } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar, useLegacyShortcuts } from "#/features/common/LegacyTransactionToolbar";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import type { LookupItem } from "#/features/common/LookupDialog";
import "#/features/reports/reportsI18n";

export type ReportDomain = "sales" | "inventory" | "purchase" | "ar";

interface ReportRowDto {
  columns: Record<string, string | number | boolean | null>;
}
interface ReportQueryResultDto {
  reportKey: string;
  rows: ReportRowDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface LegacyReportPageConfig {
  domain: ReportDomain;
  reportKey: string;
  title: string;
  /** Which optional entity filters this report accepts, beyond the always-available date range. */
  filters?: {
    customer?: boolean;
    supplier?: boolean;
    item?: boolean;
    warehouse?: boolean;
  };
  homeRoute?: string;
}

function humanizeColumnKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toCsv(rows: ReportRowDto[], columns: string[]): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map(escape).join(",");
  const body = rows.map((r) => columns.map((c) => escape(r.columns[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

/**
 * One generic report screen reused across all ~97 `ReportCatalog` keys — legacy beige report
 * chrome + common filter panel (date range, division-scoped automatically, optional
 * customer/supplier/item/warehouse) + F5 Execute + CSV export. Columns are inferred from the
 * shape of the returned rows so every report key works without a bespoke column config. See
 * docs/modules/reports/prds/report-screen-pattern.md.
 */
export function LegacyReportPage({ domain, reportKey, title, filters, homeRoute = "/report" }: LegacyReportPageConfig) {
  const { t } = useTranslation(["reports", "dialog"]);
  const navigate = useNavigate();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [supplier, setSupplier] = useState<LookupItem | null>(null);
  const [item, setItem] = useState<LookupItem | null>(null);
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [page, setPage] = useState(1);
  const [hasRun, setHasRun] = useState(false);

  const searchParams = useMemo(
    () => ({
      page,
      pageSize: 100,
      ...(dateFrom ? { from: new Date(dateFrom).toISOString() } : {}),
      ...(dateTo ? { to: new Date(dateTo).toISOString() } : {}),
      ...(customer?.id ? { customerId: customer.id } : {}),
      ...(supplier?.id ? { supplierId: supplier.id } : {}),
      ...(item?.id ? { itemId: item.id } : {}),
      ...(warehouse?.id ? { warehouseId: warehouse.id } : {}),
    }),
    [page, dateFrom, dateTo, customer, supplier, item, warehouse],
  );

  const query = useQuery({
    queryKey: ["report", domain, reportKey, searchParams],
    queryFn: () => api.get(`reports/${domain}/${reportKey}`, { searchParams }).json<ReportQueryResultDto>(),
    enabled: hasRun,
  });

  const rows = query.data?.rows ?? [];
  const columns = useMemo(() => (rows.length > 0 ? Object.keys(rows[0]!.columns) : []), [rows]);

  const run = () => {
    setPage(1);
    setHasRun(true);
    void query.refetch();
  };

  const exportCsv = () => {
    if (rows.length === 0 || columns.length === 0) return;
    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useLegacyShortcuts({
    onExecute: run,
    onClose: () => navigate(homeRoute),
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <h1 className="text-lg font-bold">{title}</h1>

      <LegacyTransactionToolbar
        mode="process"
        formState="init"
        canEdit
        canDelete={false}
        onNew={() => {}}
        onExecute={run}
        onPrint={rows.length > 0 ? exportCsv : undefined}
        onClose={() => navigate(homeRoute)}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("reports:common.dateFrom")}</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("reports:common.dateTo")}</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {filters?.customer && (
            <LookupFieldInput label={t("reports:common.customer")} type="customers" code={customer?.code ?? ""} name={customer?.name}
              onSelect={setCustomer} onClear={() => setCustomer(null)} />
          )}
          {filters?.supplier && (
            <LookupFieldInput label={t("reports:common.supplier")} type="suppliers" code={supplier?.code ?? ""} name={supplier?.name}
              onSelect={setSupplier} onClear={() => setSupplier(null)} />
          )}
          {filters?.item && (
            <LookupFieldInput label={t("reports:common.item")} type="items" code={item?.code ?? ""} name={item?.name}
              onSelect={setItem} onClear={() => setItem(null)} />
          )}
          {filters?.warehouse && (
            <LookupFieldInput label={t("reports:common.warehouse")} type="warehouses" code={warehouse?.code ?? ""} name={warehouse?.name}
              onSelect={setWarehouse} onClear={() => setWarehouse(null)} />
          )}
          <div className="flex items-end">
            <Button type="button" onClick={run} disabled={query.isFetching}>
              {t("reports:common.run")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {!hasRun ? (
            <p className="py-8 text-center text-muted-foreground">{t("reports:common.beforeRun")}</p>
          ) : query.isError ? (
            <p className="py-8 text-center text-destructive">{t("reports:common.loadError")}</p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{query.isFetching ? t("common:loading") : t("reports:common.noData")}</p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {query.data?.totalCount ?? rows.length} {t("reports:common.rowsTotal")}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="h-4 w-4" /> {t("reports:common.export")}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c}>{humanizeColumnKey(c)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={idx}>
                      {columns.map((c) => (
                        <TableCell key={c} className="font-mono">
                          {String(r.columns[c] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(query.data?.totalCount ?? 0) > (query.data?.pageSize ?? 100) && (
                <div className="mt-3 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    {t("reports:common.prev")}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                    {t("reports:common.next")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Factory used directly in `modules.tsx` route nodes — keeps the tree purely declarative. */
export function legacyReport(domain: ReportDomain, reportKey: string, title: string, filters?: LegacyReportPageConfig["filters"]) {
  return function BoundLegacyReportPage() {
    return <LegacyReportPage domain={domain} reportKey={reportKey} title={title} filters={filters} />;
  };
}
