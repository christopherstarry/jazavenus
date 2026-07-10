import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import "#/features/system/systemI18n";

interface CompanySettingsDto {
  id: string;
  division: string;
  companyName: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  fax?: string | null;
  npwpNumber?: string | null;
  pkpNumber?: string | null;
  defaultCurrency?: string | null;
}

interface FiscalPeriodDto {
  id: string;
  division: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

/** Company Preferences — legacy "Preferences" screen. See docs/modules/system/prds/company-preferences.md. */
export function CompanyPreferencesPage() {
  const { t } = useTranslation(["system", "dialog"]);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<CompanySettingsDto>>({});
  const [newYear, setNewYear] = useState(() => new Date().getFullYear());
  const [newMonth, setNewMonth] = useState(() => new Date().getMonth() + 1);

  const companyQuery = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      try {
        return await api.get("settings/company").json<CompanySettingsDto>();
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (companyQuery.data) setForm(companyQuery.data);
  }, [companyQuery.data]);

  const fiscalQuery = useQuery({
    queryKey: ["fiscal-periods"],
    queryFn: () => api.get("settings/fiscal-periods", { searchParams: { page: 1, pageSize: 50 } }).json<{ items: FiscalPeriodDto[] }>(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.put("settings/company", {
        json: {
          companyName: form.companyName ?? "",
          address: form.address ?? null,
          city: form.city ?? null,
          phone: form.phone ?? null,
          fax: form.fax ?? null,
          npwpNumber: form.npwpNumber ?? null,
          pkpNumber: form.pkpNumber ?? null,
          defaultCurrency: form.defaultCurrency ?? "IDR",
          settingsJson: null,
        },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      void companyQuery.refetch();
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const addPeriodMutation = useMutation({
    mutationFn: async () => {
      const start = new Date(newYear, newMonth - 1, 1);
      const end = new Date(newYear, newMonth, 0);
      await api.post("settings/fiscal-periods", {
        json: { year: newYear, month: newMonth, startDate: start.toISOString(), endDate: end.toISOString() },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      void queryClient.invalidateQueries({ queryKey: ["fiscal-periods"] });
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("system:preferences.title")}</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("system:preferences.title")}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t("system:preferences.companyName")} value={form.companyName ?? ""} onChange={(v) => setForm((f) => ({ ...f, companyName: v }))} />
          <Field label={t("system:preferences.address")} value={form.address ?? ""} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
          <Field label={t("system:preferences.city")} value={form.city ?? ""} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
          <Field label={t("system:preferences.phone")} value={form.phone ?? ""} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Field label={t("system:preferences.fax")} value={form.fax ?? ""} onChange={(v) => setForm((f) => ({ ...f, fax: v }))} />
          <Field label={t("system:preferences.npwp")} value={form.npwpNumber ?? ""} onChange={(v) => setForm((f) => ({ ...f, npwpNumber: v }))} />
          <Field label={t("system:preferences.pkp")} value={form.pkpNumber ?? ""} onChange={(v) => setForm((f) => ({ ...f, pkpNumber: v }))} />
          <Field label={t("system:preferences.currency")} value={form.defaultCurrency ?? "IDR"} onChange={(v) => setForm((f) => ({ ...f, defaultCurrency: v.toUpperCase() }))} />
          <div className="flex items-end">
            <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {t("system:preferences.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("system:preferences.fiscalPeriods")}</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <Field label={t("system:preferences.year")} value={String(newYear)} type="number" onChange={(v) => setNewYear(Number(v))} />
            <Field label={t("system:preferences.month")} value={String(newMonth)} type="number" onChange={(v) => setNewMonth(Number(v))} />
            <Button type="button" onClick={() => addPeriodMutation.mutate()} disabled={addPeriodMutation.isPending}>
              {t("system:preferences.addPeriod")}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("system:preferences.year")}</TableHead>
                <TableHead>{t("system:preferences.month")}</TableHead>
                <TableHead>{t("system:preferences.startDate")}</TableHead>
                <TableHead>{t("system:preferences.endDate")}</TableHead>
                <TableHead>{t("common:status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(fiscalQuery.data?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.year}</TableCell>
                  <TableCell className="font-mono">{p.month}</TableCell>
                  <TableCell className="font-mono">{p.startDate.slice(0, 10)}</TableCell>
                  <TableCell className="font-mono">{p.endDate.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Badge tone={p.isClosed ? "destructive" : "success"}>{p.isClosed ? t("system:preferences.closed") : "Open"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
