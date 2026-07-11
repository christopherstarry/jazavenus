import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Card, CardContent } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import type { LookupItem } from "#/features/common/LookupDialog";
import { useMasterDataAccess } from "#/features/master-data/useMasterDataAccess";
import "#/features/master-data/masterDataI18n";

interface ItemPriceDto {
  id: string;
  itemId: string;
  itemSku?: string | null;
  priceTierId: string;
  priceTierCode?: string | null;
  price: number;
  isActive: boolean;
}

interface ItemDiscountDto {
  id: string;
  itemId: string;
  itemSku?: string | null;
  discountCodeId: string;
  discountCodeName?: string | null;
  discountPercent: number;
  startDateUtc?: string | null;
  endDateUtc?: string | null;
  isActive: boolean;
}

/**
 * Item Pricing & Discount — bulk view over the already-implemented `master/item-prices` and
 * `master/item-discounts` CRUD APIs. See docs/modules/master-data/prds/item-pricing-and-discount.md.
 */
export function ItemPricingAndDiscountPage() {
  const { t } = useTranslation(["masterData", "dialog"]);
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("masterData:itemPricing.title")}</h1>
      <Tabs defaultValue="prices">
        <TabsList>
          <TabsTrigger value="prices">{t("masterData:itemPricing.pricesTab")}</TabsTrigger>
          <TabsTrigger value="discounts">{t("masterData:itemPricing.discountsTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="prices">
          <ItemPricesTab />
        </TabsContent>
        <TabsContent value="discounts">
          <ItemDiscountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ItemPricesTab() {
  const { t } = useTranslation(["masterData", "dialog"]);
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { canEdit, canDelete } = useMasterDataAccess();
  const queryClient = useQueryClient();
  const [item, setItem] = useState<LookupItem | null>(null);
  const [priceTier, setPriceTier] = useState<LookupItem | null>(null);
  const [price, setPrice] = useState(0);

  const query = useQuery({
    queryKey: ["item-prices"],
    queryFn: () => api.get("master/item-prices", { searchParams: { page: 1, pageSize: 100 } }).json<{ items: ItemPriceDto[] }>(),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!item?.id || !priceTier?.id) throw new Error(t("common:required"));
      await api.post("master/item-prices", { json: { itemId: item.id, priceTierId: priceTier.id, price, isActive: true } });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      setItem(null);
      setPriceTier(null);
      setPrice(0);
      void queryClient.invalidateQueries({ queryKey: ["item-prices"] });
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`master/item-prices/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["item-prices"] }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  async function handleDelete(id: string) {
    const ok = await confirm({ title: t("dialog:confirmDelete"), description: "", destructive: true });
    if (ok) deleteMutation.mutate(id);
  }

  return (
    <>
    <Card>
      <CardContent className="pt-4">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <LookupFieldInput label={t("masterData:itemPricing.item")} type="items" code={item?.code ?? ""} name={item?.name} onSelect={setItem} onClear={() => setItem(null)} />
          <LookupFieldInput label={t("masterData:itemPricing.priceTier")} type="price-tiers" code={priceTier?.code ?? ""} name={priceTier?.name} onSelect={setPriceTier} onClear={() => setPriceTier(null)} />
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:itemPricing.price")}</label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !canEdit}>
              {t("masterData:itemPricing.add")}
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("masterData:itemPricing.item")}</TableHead>
              <TableHead>{t("masterData:itemPricing.priceTier")}</TableHead>
              <TableHead>{t("masterData:itemPricing.price")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(query.data?.items ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t("masterData:itemPricing.noRows")}</TableCell></TableRow>
            ) : (
              query.data!.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.itemSku}</TableCell>
                  <TableCell className="font-mono">{row.priceTierCode}</TableCell>
                  <TableCell className="font-mono">{row.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {canDelete && (
                    <Button type="button" variant="ghost" size="iconsm" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    {confirmDialog}
    </>
  );
}

function ItemDiscountsTab() {
  const { t } = useTranslation(["masterData", "dialog"]);
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { canEdit, canDelete } = useMasterDataAccess();
  const queryClient = useQueryClient();
  const [item, setItem] = useState<LookupItem | null>(null);
  const [discountCode, setDiscountCode] = useState<LookupItem | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const query = useQuery({
    queryKey: ["item-discounts"],
    queryFn: () => api.get("master/item-discounts", { searchParams: { page: 1, pageSize: 100 } }).json<{ items: ItemDiscountDto[] }>(),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!item?.id || !discountCode?.id) throw new Error(t("common:required"));
      await api.post("master/item-discounts", {
        json: { itemId: item.id, discountCodeId: discountCode.id, discountPercent, startDateUtc: null, endDateUtc: null, isActive: true },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      setItem(null);
      setDiscountCode(null);
      setDiscountPercent(0);
      void queryClient.invalidateQueries({ queryKey: ["item-discounts"] });
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`master/item-discounts/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["item-discounts"] }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  async function handleDelete(id: string) {
    const ok = await confirm({ title: t("dialog:confirmDelete"), description: "", destructive: true });
    if (ok) deleteMutation.mutate(id);
  }

  return (
    <>
    <Card>
      <CardContent className="pt-4">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <LookupFieldInput label={t("masterData:itemPricing.item")} type="items" code={item?.code ?? ""} name={item?.name} onSelect={setItem} onClear={() => setItem(null)} />
          <LookupFieldInput label={t("masterData:itemPricing.discountCode")} type="discount-codes" code={discountCode?.code ?? ""} name={discountCode?.name} onSelect={setDiscountCode} onClear={() => setDiscountCode(null)} />
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("masterData:itemPricing.discountPercent")}</label>
            <Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !canEdit}>
              {t("masterData:itemPricing.add")}
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("masterData:itemPricing.item")}</TableHead>
              <TableHead>{t("masterData:itemPricing.discountCode")}</TableHead>
              <TableHead>{t("masterData:itemPricing.discountPercent")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(query.data?.items ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t("masterData:itemPricing.noRows")}</TableCell></TableRow>
            ) : (
              query.data!.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.itemSku}</TableCell>
                  <TableCell>{row.discountCodeName}</TableCell>
                  <TableCell className="font-mono">{row.discountPercent}%</TableCell>
                  <TableCell>
                    {canDelete && (
                    <Button type="button" variant="ghost" size="iconsm" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    {confirmDialog}
    </>
  );
}
