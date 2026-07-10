import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar, useLegacyShortcuts, type FormState } from "#/features/common/LegacyTransactionToolbar";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import { LookupDialog, type LookupItem } from "#/features/common/LookupDialog";
import "#/features/ar/arI18n";

const DocumentStatus = { Draft: 0, Posted: 10, Voided: 90 } as const;

interface ArAdjustmentDto {
  id: string;
  number: string;
  division: string;
  status: number;
  customerId: string;
  customerName?: string | null;
  adjustmentDate: string;
  amount: number;
  currency: string;
  reasonCode?: string | null;
  notes?: string | null;
}

/** A/R Adjustment — legacy `FrmAdjustmentAR`. See docs/modules/ar/prds/ar-adjustment.md. */
export function ArAdjustmentPage() {
  const { t } = useTranslation(["ar", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [adjustmentDate, setAdjustmentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(0);
  const [isDebit, setIsDebit] = useState(true);
  const [reasonCode, setReasonCode] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<number>(DocumentStatus.Draft);
  const [docNumber, setDocNumber] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const isNew = docId === null;
  const isPosted = status === DocumentStatus.Posted;
  const readOnly = isPosted || status === DocumentStatus.Voided;
  const formState: FormState = isNew ? (dirty ? "insert" : "init") : isPosted ? "posted" : "normal";
  const markDirty = useCallback(() => setDirty(true), []);

  const resetForm = useCallback(() => {
    setDocId(null);
    setCustomer(null);
    setAdjustmentDate(new Date().toISOString().slice(0, 10));
    setAmount(0);
    setIsDebit(true);
    setReasonCode("");
    setNotes("");
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: ArAdjustmentDto) => {
    setDocId(dto.id);
    setCustomer({ id: dto.customerId, code: "", name: dto.customerName ?? "" });
    setAdjustmentDate(dto.adjustmentDate.slice(0, 10));
    setAmount(Math.abs(dto.amount));
    setIsDebit(dto.amount >= 0);
    setReasonCode(dto.reasonCode ?? "");
    setNotes(dto.notes ?? "");
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`ar/adjustments/${id}`).json<ArAdjustmentDto>()), [loadDoc]);

  const buildPayload = useCallback(
    () => ({
      customerId: customer?.id,
      adjustmentDate: adjustmentDate ? new Date(adjustmentDate).toISOString() : null,
      amount: isDebit ? Math.abs(amount) : -Math.abs(amount),
      currency: "IDR",
      reasonCode: reasonCode || null,
      notes: notes || null,
    }),
    [customer, adjustmentDate, amount, isDebit, reasonCode, notes],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.customerId || !payload.amount) throw new Error(t("common:required"));
      if (isNew) loadDoc(await api.post("ar/adjustments", { json: payload }).json<ArAdjustmentDto>());
      else {
        await api.put(`ar/adjustments/${docId}`, { json: payload });
        await openDoc(docId!);
      }
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`ar/adjustments/${docId}/post`);
      await openDoc(docId!);
    },
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`ar/adjustments/${docId}`),
    onSuccess: () => {
      toast({ title: t("dialog:deleteSuccess"), variant: "success" });
      resetForm();
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleSave = useCallback(async () => {
    if (!isNew) {
      const ok = await confirm({ title: t("dialog:confirmSave"), description: "" });
      if (!ok) return;
    }
    saveMutation.mutate();
  }, [isNew, confirm, saveMutation, t]);

  const handleDelete = useCallback(async () => {
    if (isNew) return;
    const ok = await confirm({ title: t("dialog:confirmDelete"), description: docNumber ?? "", destructive: true });
    if (!ok) return;
    deleteMutation.mutate();
  }, [isNew, confirm, deleteMutation, docNumber, t]);

  const handleNew = useCallback(async () => {
    if (dirty) {
      const ok = await confirm({ title: t("ar:common.newDocPrompt"), description: "" });
      if (!ok) return;
    }
    resetForm();
  }, [dirty, confirm, resetForm, t]);

  useLegacyShortcuts({
    onNew: handleNew,
    onSave: !readOnly ? handleSave : undefined,
    onDelete: !readOnly && !isNew ? handleDelete : undefined,
    onUndo: isNew ? resetForm : undefined,
    onBrowse: () => setBrowseOpen(true),
    onExecute: formState === "normal" ? () => postMutation.mutate() : undefined,
    onClose: () => navigate("/ar"),
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("ar:adjustment.title")}</h1>
        {docNumber && <Badge tone={isPosted ? "success" : "neutral"}>{docNumber}</Badge>}
      </div>

      <LegacyTransactionToolbar
        mode="transaction"
        formState={formState}
        canEdit
        canDelete
        isDirty={dirty}
        isSaving={saveMutation.isPending}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onUndo={resetForm}
        onExecute={() => postMutation.mutate()}
        onClose={() => navigate("/ar")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("ar:common.customer")} type="customers" code={customer?.code ?? ""} name={customer?.name} disabled={readOnly} required
            onSelect={(item) => { setCustomer(item); markDirty(); }} onClear={() => setCustomer(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:adjustment.adjustmentDate")}</Label>
            <Input type="date" value={adjustmentDate} disabled={readOnly} onChange={(e) => { setAdjustmentDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:adjustment.reasonCode")}</Label>
            <Input value={reasonCode} disabled={readOnly} onChange={(e) => { setReasonCode(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:common.amount")}</Label>
            <Input type="number" value={amount} disabled={readOnly} onChange={(e) => { setAmount(Number(e.target.value)); markDirty(); }} />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={isDebit} disabled={readOnly} onChange={() => { setIsDebit(true); markDirty(); }} />
              {t("ar:adjustment.debit")}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!isDebit} disabled={readOnly} onChange={() => { setIsDebit(false); markDirty(); }} />
              {t("ar:adjustment.credit")}
            </label>
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("ar:common.notes")}</Label>
            <Textarea value={notes} disabled={readOnly} onChange={(e) => { setNotes(e.target.value); markDirty(); }} />
          </div>
        </CardContent>
      </Card>

      <LookupDialog type="ar-adjustments" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      {dialog}
    </div>
  );
}
