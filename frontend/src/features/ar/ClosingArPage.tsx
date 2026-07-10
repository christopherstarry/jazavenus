import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Card, CardContent } from "#/components/ui/card";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import "#/features/ar/arI18n";

/** Closing A/R — legacy `frmClosingAR`. See docs/modules/ar/prds/closing-ar.md. */
export function ClosingArPage() {
  const { t } = useTranslation(["ar", "dialog"]);
  const { confirm, dialog } = useConfirm();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [notes, setNotes] = useState("");

  const closeMutation = useMutation({
    mutationFn: async () => api.post("ar/close-period", { json: { year, month, notes: notes || null } }),
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleClose = async () => {
    const ok = await confirm({ title: t("dialog:confirmSave"), description: `${year}-${String(month).padStart(2, "0")}`, destructive: true });
    if (ok) closeMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("ar:closing.title")}</h1>
      <LegacyTransactionToolbar mode="process" formState="init" canEdit canDelete={false} onNew={() => {}} onExecute={handleClose} onClose={() => {}} />
      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:closing.year")}</Label>
            <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:closing.month")}</Label>
            <Input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("ar:common.notes")}</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      {dialog}
    </div>
  );
}
