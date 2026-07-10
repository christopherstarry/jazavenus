import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import type { LookupItem } from "#/features/common/LookupDialog";
import "#/features/inventory/inventoryI18n";

interface StockTakeSessionDto {
  id: string;
  number: string;
  lines: unknown[];
}

/** Stock Taking Preparation — snapshots on-hand for a warehouse into a new counting session. See docs/modules/inventory/prds/stock-taking.md. */
export function StockTakingPreparationPage() {
  const { t } = useTranslation(["inventory", "dialog"]);
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const prepMutation = useMutation({
    mutationFn: async () => {
      if (!warehouse?.id) throw new Error(t("common:required"));
      const dto = await api
        .post("inventory/stock-takes/prep", {
          json: { warehouseId: warehouse.id, sessionDate: new Date(sessionDate).toISOString(), notes: notes || null },
        })
        .json<StockTakeSessionDto>();
      return dto;
    },
    onSuccess: (dto) => {
      toast({ title: t("dialog:saveSuccess"), description: `${dto.number} — ${dto.lines.length} lines`, variant: "success" });
      navigate(`/inventory/stock-taking-record?session=${dto.id}`);
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <h1 className="text-lg font-bold">{t("inventory:stockTaking.preparationTitle")}</h1>

      <LegacyTransactionToolbar
        mode="process"
        formState="init"
        canEdit
        canDelete={false}
        onNew={() => {}}
        onExecute={() => prepMutation.mutate()}
        onClose={() => navigate("/inventory")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("inventory:common.warehouse")} type="warehouses" code={warehouse?.code ?? ""} name={warehouse?.name} required
            onSelect={setWarehouse} onClear={() => setWarehouse(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("inventory:stockTaking.sessionDate")}</Label>
            <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("inventory:common.notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="button" onClick={() => prepMutation.mutate()} disabled={prepMutation.isPending || !warehouse}>
            {t("inventory:stockTaking.prepareButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
