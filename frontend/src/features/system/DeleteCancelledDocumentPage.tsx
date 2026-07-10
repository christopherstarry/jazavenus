import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Card, CardContent } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import "#/features/system/systemI18n";

interface DeleteCancelledResultDto {
  documentType: string;
  matchedCount: number;
  dryRun: boolean;
  documentNumbers: string[];
}

const DOCUMENT_TYPES = ["SO", "PO", "DO", "INV"] as const;

/** Delete Cancelled Document — legacy admin cleanup utility. See docs/modules/system/prds/delete-cancelled-document.md. */
export function DeleteCancelledDocumentPage() {
  const { t } = useTranslation(["system", "dialog"]);
  const { confirm, dialog } = useConfirm();
  const [documentType, setDocumentType] = useState("SO");
  const [dateFrom, setDateFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  const runMutation = useMutation({
    mutationFn: async (dryRun: boolean) =>
      api
        .post("system/delete-cancelled-document", {
          json: { documentType, dateFrom: new Date(dateFrom).toISOString(), dateTo: new Date(dateTo).toISOString(), division: null, dryRun },
        })
        .json<DeleteCancelledResultDto>(),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleExecute = async () => {
    const preview = await runMutation.mutateAsync(true);
    if (preview.matchedCount === 0) return;
    const ok = await confirm({
      title: t("dialog:validationError"),
      description: t("system:deleteCancelled.confirmDelete", { count: preview.matchedCount }),
      destructive: true,
    });
    if (ok) runMutation.mutate(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("system:deleteCancelled.title")}</h1>

      <LegacyTransactionToolbar mode="process" formState="init" canEdit canDelete={false} onNew={() => {}} onExecute={() => runMutation.mutate(true)} onClose={() => {}} />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("system:deleteCancelled.documentType")}</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="flex h-12 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base">
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{t(`system:deleteCancelled.types.${type}`)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("system:deleteCancelled.dateFrom")}</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("system:deleteCancelled.dateTo")}</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="outline" onClick={() => runMutation.mutate(true)} disabled={runMutation.isPending}>
              {t("system:deleteCancelled.preview")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleExecute} disabled={runMutation.isPending}>
              {t("system:deleteCancelled.execute")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {runMutation.data && (
        <Card>
          <CardContent className="pt-4">
            <p className="mb-3 font-semibold">
              {t("system:deleteCancelled.matched")}: {runMutation.data.matchedCount} {runMutation.data.dryRun ? `(${t("system:deleteCancelled.preview")})` : ""}
            </p>
            <Table>
              <TableHeader>
                <TableRow><TableHead>#</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {runMutation.data.documentNumbers.map((n) => (
                  <TableRow key={n}><TableCell className="font-mono">{n}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {dialog}
    </div>
  );
}
