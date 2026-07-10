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

interface BpItemDto {
  id: string;
  supplierId: string;
  supplierCode?: string | null;
  supplierItemCode: string;
  itemId: string;
  itemSku?: string | null;
  uom?: string | null;
  conversionFactor: number;
}

/** BP Item — supplier item cross-reference. See docs/modules/master-data/prds/bp-item.md. */
export function BpItemPage() {
  const { t } = useTranslation(["masterData", "dialog"]);
  const queryClient = useQueryClient();
  const [supplier, setSupplier] = useState<LookupItem | null>(null);
  const [supplierItemCode, setSupplierItemCode] = useState("");
  const [item, setItem] = useState<LookupItem | null>(null);
  const [uom, setUom] = useState("");
  const [conversionFactor, setConversionFactor] = useState(1);

  const query = useQuery({
    queryKey: ["bp-items"],
    queryFn: () => api.get("master/bp-items", { searchParams: { page: 1, pageSize: 100 } }).json<{ items: BpItemDto[] }>(),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!supplier?.id || !item?.id || !supplierItemCode) throw new Error(t("common:required"));
      await api.post("master/bp-items", {
        json: { supplierId: supplier.id, supplierItemCode, itemId: item.id, uom: uom || null, conversionFactor, isActive: true },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      setSupplier(null);
      setSupplierItemCode("");
      setItem(null);
      setUom("");
      setConversionFactor(1);
      void queryClient.invalidateQueries({ queryKey: ["bp-items"] });
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`master/bp-items/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["bp-items"] }),
  });

  return (
    <div className="p-3 sm:p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("masterData:bpItem.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <LookupFieldInput label={t("masterData:bpItem.supplier")} type="suppliers" code={supplier?.code ?? ""} name={supplier?.name} onSelect={setSupplier} onClear={() => setSupplier(null)} />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:bpItem.supplierItemCode")}</label>
              <Input value={supplierItemCode} onChange={(e) => setSupplierItemCode(e.target.value)} />
            </div>
            <LookupFieldInput label={t("masterData:bpItem.item")} type="items" code={item?.code ?? ""} name={item?.name} onSelect={setItem} onClear={() => setItem(null)} />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:bpItem.uom")}</label>
              <Input value={uom} onChange={(e) => setUom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:bpItem.conversionFactor")}</label>
              <div className="flex gap-2">
                <Input type="number" value={conversionFactor} onChange={(e) => setConversionFactor(Number(e.target.value))} />
                <Button type="button" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                  {t("masterData:itemPricing.add")}
                </Button>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("masterData:bpItem.supplier")}</TableHead>
                <TableHead>{t("masterData:bpItem.supplierItemCode")}</TableHead>
                <TableHead>{t("masterData:bpItem.item")}</TableHead>
                <TableHead>{t("masterData:bpItem.uom")}</TableHead>
                <TableHead>{t("masterData:bpItem.conversionFactor")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">{t("masterData:itemPricing.noRows")}</TableCell></TableRow>
              ) : (
                query.data!.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.supplierCode}</TableCell>
                    <TableCell className="font-mono">{row.supplierItemCode}</TableCell>
                    <TableCell className="font-mono">{row.itemSku}</TableCell>
                    <TableCell>{row.uom}</TableCell>
                    <TableCell className="font-mono">{row.conversionFactor}</TableCell>
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
