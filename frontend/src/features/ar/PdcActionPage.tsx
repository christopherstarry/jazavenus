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
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar, useLegacyShortcuts } from "#/features/common/LegacyTransactionToolbar";
import { LookupDialog } from "#/features/common/LookupDialog";
import "#/features/ar/arI18n";

/** Jaza.Domain.Ar.PaymentAllocation.PdcStatus values as serialized by System.Text.Json. */
const PdcStatus = { Outstanding: 0, Cleared: 10, Bounced: 20 } as const;

interface PostDatedCheckDto {
  id: string;
  number: string;
  status: number;
  customerId: string;
  customerName?: string | null;
  bankCode?: string | null;
  amount: number;
  currency: string;
  chequeDate: string;
  receivedAt: string;
  reference?: string | null;
}

export interface PdcActionPageConfig {
  variant: "clear" | "cancel";
  titleKey: string;
  actionLabelKey: string;
  requiredStatus: number;
  homeRoute: string;
}

/**
 * Shared PDC Clearance / Clearance Cancellation screen — legacy `frmCheckGiroClearing`. Both flows
 * browse a giro, show its detail, and post one action. See docs/modules/ar/prds/pdc-clearance.md
 * and pdc-clearance-cancellation.md.
 */
export function PdcActionPage({ variant, titleKey, actionLabelKey, requiredStatus, homeRoute }: PdcActionPageConfig) {
  const { t } = useTranslation(["ar", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [browseOpen, setBrowseOpen] = useState(false);
  const [pdc, setPdc] = useState<PostDatedCheckDto | null>(null);
  const [notes, setNotes] = useState("");

  const loadPdc = useCallback(async (id: string) => {
    const dto = await api.get(`ar/pdc/${id}`).json<PostDatedCheckDto>();
    setPdc(dto);
  }, []);

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!pdc) return;
      const path = variant === "clear" ? "clear" : "cancel-clearance";
      await api.post(`ar/pdc/${pdc.id}/${path}`, { json: { notes: notes || null } });
      await loadPdc(pdc.id);
    },
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleAction = useCallback(async () => {
    const ok = await confirm({ title: t(actionLabelKey), description: pdc?.number ?? "" });
    if (!ok) return;
    actionMutation.mutate();
  }, [confirm, actionMutation, pdc, t, actionLabelKey]);

  const canAct = pdc?.status === requiredStatus;

  useLegacyShortcuts({
    onBrowse: () => setBrowseOpen(true),
    onExecute: canAct ? handleAction : undefined,
    onClose: () => navigate(homeRoute),
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t(titleKey)}</h1>
        {pdc && (
          <Badge tone={pdc.status === PdcStatus.Cleared ? "success" : pdc.status === PdcStatus.Bounced ? "destructive" : "neutral"}>
            {pdc.number}
          </Badge>
        )}
      </div>

      <LegacyTransactionToolbar
        mode="transaction"
        formState={pdc ? "normal" : "init"}
        canEdit
        canDelete={false}
        onNew={() => { setPdc(null); setNotes(""); }}
        onExecute={handleAction}
        onClose={() => navigate(homeRoute)}
      />

      <Card>
        <CardContent className="pt-4">
          {!pdc ? (
            <p className="py-8 text-center text-muted-foreground">
              <button type="button" className="font-semibold text-primary underline" onClick={() => setBrowseOpen(true)}>
                {t(variant === "clear" ? "ar:pdcClearance.outstandingPdc" : "ar:pdcCancellation.clearedPdc")}
              </button>
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={t("ar:common.customer")} value={pdc.customerName ?? ""} />
              <Field label={t("ar:pdcClearance.chequeNo")} value={pdc.number} />
              <Field label={t("ar:pdcClearance.bank")} value={pdc.bankCode ?? ""} />
              <Field label={t("ar:common.amount")} value={pdc.amount.toLocaleString()} />
              <Field label={t("ar:pdcClearance.chequeDate")} value={pdc.chequeDate.slice(0, 10)} />
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <Label className="text-xs uppercase tracking-wide">{t("ar:pdcCancellation.reason")}</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!canAct} />
              </div>
              {!canAct && (
                <p className="text-sm text-destructive sm:col-span-2 lg:col-span-3">{t("dialog:locked")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <LookupDialog type="post-dated-checks" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void loadPdc(item.id)} />
      {dialog}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide">{label}</Label>
      <Input readOnly value={value} />
    </div>
  );
}
