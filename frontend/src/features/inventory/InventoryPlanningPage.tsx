import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Card, CardContent } from "#/components/ui/card";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import type { LookupItem } from "#/features/common/LookupDialog";
import "#/features/inventory/inventoryI18n";

interface ReportRowDto {
  columns: Record<string, string | number | null>;
}
interface ReportQueryResultDto {
  reportKey: string;
  rows: ReportRowDto[];
  totalCount: number;
}

/**
 * Inventory Planning — reads the already-implemented `inventory:reorder-suggestion` report
 * (see ReportQueryService.InventoryReorderSuggestion) rather than a bespoke endpoint. See
 * docs/modules/inventory/prds/inventory-planning.md.
 */
export function InventoryPlanningPage() {
  const { t } = useTranslation(["inventory", "dialog"]);
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const query = useQuery({
    queryKey: ["inventory-planning", warehouse?.id],
    queryFn: () =>
      api
        .get("reports/inventory/reorder-suggestion", {
          searchParams: { pageSize: 200, ...(warehouse?.id ? { warehouseId: warehouse.id } : {}) },
        })
        .json<ReportQueryResultDto>(),
    enabled: hasRun,
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <h1 className="text-lg font-bold">{t("inventory:planning.title")}</h1>

      <LegacyTransactionToolbar
        mode="process"
        formState="init"
        canEdit
        canDelete={false}
        onNew={() => {}}
        onExecute={() => {
          setHasRun(true);
          void query.refetch();
        }}
        onClose={() => navigate("/inventory")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("inventory:planning.warehouse")} type="warehouses" code={warehouse?.code ?? ""} name={warehouse?.name}
            onSelect={setWarehouse} onClear={() => setWarehouse(null)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {!hasRun ? (
            <p className="py-8 text-center text-muted-foreground">{t("inventory:planning.empty")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory:planning.item")}</TableHead>
                  <TableHead>{t("inventory:planning.onHand")}</TableHead>
                  <TableHead>{t("inventory:planning.reorderLevel")}</TableHead>
                  <TableHead>{t("inventory:planning.suggestedQty")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data?.rows.length ? (
                  query.data.rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <span className="font-mono">{r.columns.sku}</span> <span className="text-muted-foreground">{r.columns.itemName}</span>
                      </TableCell>
                      <TableCell className="font-mono">{r.columns.onHand}</TableCell>
                      <TableCell className="font-mono">{r.columns.reorderLevel}</TableCell>
                      <TableCell className="font-mono font-semibold">{r.columns.suggestedOrderQty}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      {t("inventory:planning.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
