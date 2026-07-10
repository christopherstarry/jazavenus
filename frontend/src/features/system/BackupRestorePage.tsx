import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import "#/features/system/systemI18n";

interface BackupJobDto {
  fileName: string;
  sizeBytes: number;
  createdAtUtc: string;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Backup & Restore — ops screen wrapping pg_dump/psql. See docs/modules/system/prds/backup-restore.md. */
export function BackupRestorePage() {
  const { t } = useTranslation(["system", "dialog"]);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmPhrase, setConfirmPhrase] = useState("");

  const historyQuery = useQuery({
    queryKey: ["backup-history"],
    queryFn: () => api.get("system/backup/history").json<BackupJobDto[]>(),
  });

  const backupMutation = useMutation({
    mutationFn: async () => api.post("system/backup", { timeout: 120_000 }).json<BackupJobDto>(),
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      void queryClient.invalidateQueries({ queryKey: ["backup-history"] });
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const restoreMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("system/restore", { body: formData, timeout: 300_000 }).json<{ success: boolean; message?: string }>();
    },
    onSuccess: (res) => {
      if (res.success) toast({ title: t("dialog:saveSuccess"), variant: "success" });
      else toast({ title: t("dialog:genericError"), description: res.message ?? "", variant: "destructive" });
      setConfirmPhrase("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleRestore = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || confirmPhrase !== "RESTORE") return;
    restoreMutation.mutate(file);
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("system:backup.title")}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("system:backup.history")}</CardTitle>
          <Button type="button" onClick={() => backupMutation.mutate()} disabled={backupMutation.isPending}>
            {t("system:backup.createBackup")}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("system:backup.fileName")}</TableHead>
                <TableHead>{t("system:backup.size")}</TableHead>
                <TableHead>{t("system:backup.created")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(historyQuery.data ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t("masterData:itemPricing.noRows")}</TableCell></TableRow>
              ) : (
                historyQuery.data!.map((b) => (
                  <TableRow key={b.fileName}>
                    <TableCell className="font-mono">{b.fileName}</TableCell>
                    <TableCell>{formatBytes(b.sizeBytes)}</TableCell>
                    <TableCell className="font-mono">{new Date(b.createdAtUtc).toLocaleString()}</TableCell>
                    <TableCell>
                      <a href={`/api/system/backup/${b.fileName}/download`} target="_blank" rel="noreferrer">
                        <Button type="button" variant="outline" size="iconsm"><Download className="h-4 w-4" /></Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base text-destructive">{t("system:backup.restoreTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-md border-2 border-destructive/40 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {t("system:backup.restoreWarning")}
          </p>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("system:backup.selectFile")}</label>
            <input ref={fileInputRef} type="file" accept=".sql" className="block w-full text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("system:backup.confirmPhrase")}</label>
            <Input value={confirmPhrase} onChange={(e) => setConfirmPhrase(e.target.value)} />
          </div>
          <Button type="button" variant="destructive" onClick={handleRestore} disabled={confirmPhrase !== "RESTORE" || restoreMutation.isPending}>
            {t("system:backup.restore")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
