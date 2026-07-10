import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import type { LookupItem } from "#/features/common/LookupDialog";
import "#/features/master-data/masterDataI18n";

interface PenetrationDto {
  id: string;
  customerId: string;
  customerName?: string | null;
  itemId?: string | null;
  itemSku?: string | null;
  brandId?: string | null;
  brandCode?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  targetSkuCount: number;
  periodYear: number;
  periodMonth: number;
}

/** Customer Penetration — SKU-coverage targets. See docs/modules/master-data/prds/penetration.md. */
export function PenetrationPage() {
  const { t } = useTranslation(["masterData", "dialog"]);
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [brand, setBrand] = useState<LookupItem | null>(null);
  const [category, setCategory] = useState<LookupItem | null>(null);
  const [targetSkuCount, setTargetSkuCount] = useState(0);
  const now = new Date();
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);

  const query = useQuery({
    queryKey: ["penetrations"],
    queryFn: () => api.get("master/penetrations", { searchParams: { page: 1, pageSize: 100 } }).json<{ items: PenetrationDto[] }>(),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!customer?.id) throw new Error(t("common:required"));
      await api.post("master/penetrations", {
        json: {
          customerId: customer.id, itemId: null, brandId: brand?.id ?? null, categoryId: category?.id ?? null,
          targetSkuCount, periodYear, periodMonth,
        },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      setCustomer(null);
      setBrand(null);
      setCategory(null);
      setTargetSkuCount(0);
      void queryClient.invalidateQueries({ queryKey: ["penetrations"] });
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`master/penetrations/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["penetrations"] }),
  });

  return (
    <div className="p-3 sm:p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("masterData:penetration.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <LookupFieldInput label={t("masterData:penetration.customer")} type="customers" code={customer?.code ?? ""} name={customer?.name} onSelect={setCustomer} onClear={() => setCustomer(null)} />
            <LookupFieldInput label={t("masterData:penetration.brand")} type="brands" code={brand?.code ?? ""} name={brand?.name} onSelect={setBrand} onClear={() => setBrand(null)} />
            <LookupFieldInput label={t("masterData:penetration.category")} type="categories" code={category?.code ?? ""} name={category?.name} onSelect={setCategory} onClear={() => setCategory(null)} />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:penetration.targetSkuCount")}</label>
              <Input type="number" value={targetSkuCount} onChange={(e) => setTargetSkuCount(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:penetration.periodYear")}</label>
              <Input type="number" value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:penetration.periodMonth")}</label>
              <div className="flex gap-2">
                <Input type="number" min={1} max={12} value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))} />
                <Button type="button" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                  {t("masterData:itemPricing.add")}
                </Button>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("masterData:penetration.customer")}</TableHead>
                <TableHead>{t("masterData:penetration.brand")}</TableHead>
                <TableHead>{t("masterData:penetration.category")}</TableHead>
                <TableHead>{t("masterData:penetration.targetSkuCount")}</TableHead>
                <TableHead>{t("masterData:penetration.periodYear")}/{t("masterData:penetration.periodMonth")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">{t("masterData:itemPricing.noRows")}</TableCell></TableRow>
              ) : (
                query.data!.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell className="font-mono">{row.brandCode}</TableCell>
                    <TableCell>{row.categoryName}</TableCell>
                    <TableCell className="font-mono">{row.targetSkuCount}</TableCell>
                    <TableCell className="font-mono">{row.periodYear}-{String(row.periodMonth).padStart(2, "0")}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="iconsm" onClick={() => deleteMutation.mutate(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
