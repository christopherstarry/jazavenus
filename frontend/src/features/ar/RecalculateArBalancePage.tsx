import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Card, CardContent } from "#/components/ui/card";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import "#/features/ar/arI18n";

/** Recalculate AR Balance — legacy admin tool rebuilding outstanding totals from the ledger. See docs/modules/ar/prds/recalculate-ar-balance.md. */
export function RecalculateArBalancePage() {
  const { t } = useTranslation(["ar", "dialog"]);
  const { confirm, dialog } = useConfirm();

  const runMutation = useMutation({
    mutationFn: async () => api.post("ar/recalculate-balance"),
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleRun = async () => {
    const ok = await confirm({ title: t("dialog:confirmSave"), description: "" });
    if (ok) runMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("ar:recalculate.title")}</h1>
      <LegacyTransactionToolbar mode="process" formState="init" canEdit canDelete={false} onNew={() => {}} onExecute={handleRun} onClose={() => {}} />
      <Card>
        <CardContent className="pt-4 text-muted-foreground">
          {t("ar:recalculate.description")}
        </CardContent>
      </Card>
      {dialog}
    </div>
  );
}
