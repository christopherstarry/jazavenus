import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Input } from "#/components/ui/input";
import { Card, CardContent } from "#/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import "#/features/system/systemI18n";

interface PeriodEndStepDto {
  stepId: string;
  name: string;
  status: string;
  message?: string | null;
}

const DIVISION = "DISTRIBUTIONBDG";

/** Period-End Processes — legacy Monthly + Day-End Process. See docs/modules/system/prds/period-end-processes.md. */
export function PeriodEndProcessesPage() {
  const { t } = useTranslation(["system", "dialog"]);
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("system:periodEnd.title")}</h1>
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">{t("system:periodEnd.monthlyTab")}</TabsTrigger>
          <TabsTrigger value="dayend">{t("system:periodEnd.dayEndTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly"><MonthlyProcessTab /></TabsContent>
        <TabsContent value="dayend"><DayEndProcessTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StepList({ steps }: { steps: PeriodEndStepDto[] }) {
  return (
    <ul className="space-y-2">
      {steps.map((s) => (
        <li key={s.stepId} className="flex items-start gap-2 rounded-md border-2 p-3">
          {s.status === "Done" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
          <div>
            <p className="font-semibold">{s.name}</p>
            {s.message && <p className="text-sm text-muted-foreground">{s.message}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function MonthlyProcessTab() {
  const { t } = useTranslation(["system", "dialog"]);
  const { confirm, dialog } = useConfirm();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const runMutation = useMutation({
    mutationFn: async () => api.post("system/monthly-process", { json: { division: DIVISION, year, month } }).json<{ steps: PeriodEndStepDto[] }>(),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleRun = async () => {
    const ok = await confirm({ title: t("system:periodEnd.run"), description: `${year}-${String(month).padStart(2, "0")}` });
    if (ok) runMutation.mutate();
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <LegacyTransactionToolbar mode="process" formState="init" canEdit canDelete={false} onNew={() => {}} onExecute={handleRun} onClose={() => {}} />
        <div className="my-4 flex flex-wrap items-end gap-3">
          <Field label={t("system:periodEnd.year")} value={String(year)} onChange={(v) => setYear(Number(v))} />
          <Field label={t("system:periodEnd.month")} value={String(month)} onChange={(v) => setMonth(Number(v))} />
        </div>
        {runMutation.isPending && <p className="text-muted-foreground">{t("system:periodEnd.running")}</p>}
        {runMutation.data && <StepList steps={runMutation.data.steps} />}
        {dialog}
      </CardContent>
    </Card>
  );
}

function DayEndProcessTab() {
  const { t } = useTranslation(["system", "dialog"]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const runMutation = useMutation({
    mutationFn: async () => api.post("system/day-end", { json: { division: DIVISION, date: new Date(date).toISOString() } }).json<{ steps: PeriodEndStepDto[] }>(),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  return (
    <Card>
      <CardContent className="pt-4">
        <LegacyTransactionToolbar mode="process" formState="init" canEdit canDelete={false} onNew={() => {}} onExecute={() => runMutation.mutate()} onClose={() => {}} />
        <div className="my-4">
          <Field label={t("system:periodEnd.date")} value={date} type="date" onChange={setDate} />
        </div>
        {runMutation.isPending && <p className="text-muted-foreground">{t("system:periodEnd.running")}</p>}
        {runMutation.data && <StepList steps={runMutation.data.steps} />}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, type = "number" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
