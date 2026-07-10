import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
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
import { EditableLineGrid, toSubmitLines, type EditableLineRow } from "#/features/common/EditableLineGrid";
import "#/features/purchase/purchaseI18n";

const DocumentStatus = { Draft: 0, Posted: 10, Voided: 90 } as const;

interface PurchaseOrderLineDto {
  id?: string;
  lineNumber: number;
  itemId: string;
  itemSku?: string | null;
  itemName?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  quantityReceived: number;
  quantityOpen: number;
}

interface PurchaseOrderDto {
  id: string;
  number: string;
  status: number;
  supplierId: string;
  supplierName?: string | null;
  warehouseId: string;
  warehouseCode?: string | null;
  orderDate: string;
  expectedDate?: string | null;
  currency: string;
  notes?: string | null;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  lines: PurchaseOrderLineDto[];
}

interface LineRow extends EditableLineRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return { lineNumber, _status: "insert", itemId: "", itemCode: "", itemName: "", quantity: 0, unitPrice: 0, discountPercent: 0, taxPercent: 0 };
}

/** Purchase Order — legacy `frmPurchaseOrder` (ObjType 31). See docs/modules/purchase/prds/purchase-order.md. */
export function PurchaseOrderPage() {
  const { t } = useTranslation(["purchase", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [supplier, setSupplier] = useState<LookupItem | null>(null);
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);
  const [status, setStatus] = useState<number>(DocumentStatus.Draft);
  const [docNumber, setDocNumber] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const isNew = docId === null;
  const isPosted = status === DocumentStatus.Posted;
  const readOnly = isPosted || status === DocumentStatus.Voided;
  const formState: FormState = isNew ? (dirty ? "insert" : "init") : isPosted ? "posted" : status === DocumentStatus.Voided ? "voided" : "normal";
  const markDirty = useCallback(() => setDirty(true), []);

  const resetForm = useCallback(() => {
    setDocId(null);
    setSupplier(null);
    setWarehouse(null);
    setOrderDate(new Date().toISOString().slice(0, 10));
    setExpectedDate("");
    setCurrency("IDR");
    setNotes("");
    setLines([]);
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: PurchaseOrderDto) => {
    setDocId(dto.id);
    setSupplier({ id: dto.supplierId, code: "", name: dto.supplierName ?? "" });
    setWarehouse({ id: dto.warehouseId, code: dto.warehouseCode ?? "", name: "" });
    setOrderDate(dto.orderDate.slice(0, 10));
    setExpectedDate(dto.expectedDate?.slice(0, 10) ?? "");
    setCurrency(dto.currency);
    setNotes(dto.notes ?? "");
    setLines(dto.lines.map((l) => ({
      id: l.id, lineNumber: l.lineNumber, _status: "unchanged", itemId: l.itemId,
      itemCode: l.itemSku ?? "", itemName: l.itemName ?? "",
      quantity: l.quantity, unitPrice: l.unitPrice, discountPercent: l.discountPercent, taxPercent: l.taxPercent,
    })));
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`inbound/purchase-orders/${id}`).json<PurchaseOrderDto>()), [loadDoc]);

  const buildPayload = useCallback(
    () => ({
      supplierId: supplier?.id,
      warehouseId: warehouse?.id,
      orderDate: orderDate ? new Date(orderDate).toISOString() : null,
      expectedDate: expectedDate ? new Date(expectedDate).toISOString() : null,
      currency,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber, itemId: l.itemId, quantity: l.quantity,
        unitPrice: l.unitPrice, discountPercent: l.discountPercent, taxPercent: l.taxPercent,
      })),
    }),
    [supplier, warehouse, orderDate, expectedDate, currency, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.supplierId || !payload.warehouseId) throw new Error(t("common:required"));
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));
      if (isNew) loadDoc(await api.post("inbound/purchase-orders", { json: payload }).json<PurchaseOrderDto>());
      else {
        await api.put(`inbound/purchase-orders/${docId}`, { json: payload });
        await openDoc(docId!);
      }
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`inbound/purchase-orders/${docId}/post`);
      await openDoc(docId!);
    },
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleSave = useCallback(async () => {
    if (!isNew) {
      const ok = await confirm({ title: t("dialog:confirmSave"), description: "" });
      if (!ok) return;
    }
    saveMutation.mutate();
  }, [isNew, confirm, saveMutation, t]);

  const handleNew = useCallback(async () => {
    if (dirty) {
      const ok = await confirm({ title: t("purchase:common.newDocPrompt"), description: "" });
      if (!ok) return;
    }
    resetForm();
  }, [dirty, confirm, resetForm, t]);

  useLegacyShortcuts({
    onNew: handleNew,
    onSave: !readOnly ? handleSave : undefined,
    onUndo: isNew ? resetForm : undefined,
    onBrowse: () => setBrowseOpen(true),
    onExecute: formState === "normal" ? () => postMutation.mutate() : undefined,
    onClose: () => navigate("/purchase"),
  });

  const columns = useMemo<ColumnDef<LineRow>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: t("purchase:common.item"),
        cell: ({ row }) => <ItemCell row={row.original} readOnly={readOnly} onChange={(next) => { setLines((prev) => prev.map((l, i) => (i === row.index ? next : l))); markDirty(); }} />,
      },
      {
        accessorKey: "quantity",
        header: t("purchase:common.qty"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-24" value={row.original.quantity} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, quantity: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
      {
        accessorKey: "unitPrice",
        header: t("purchase:common.unitPrice"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-28" value={row.original.unitPrice} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, unitPrice: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
      {
        accessorKey: "discountPercent",
        header: t("purchase:common.discPercent"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-20" value={row.original.discountPercent} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, discountPercent: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
    ],
    [t, readOnly, markDirty],
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("purchase:purchaseOrder.title")}</h1>
        {docNumber && <Badge tone={isPosted ? "success" : status === DocumentStatus.Voided ? "destructive" : "neutral"}>{docNumber}</Badge>}
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
        onUndo={resetForm}
        onExecute={() => postMutation.mutate()}
        onClose={() => navigate("/purchase")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("purchase:common.supplier")} type="suppliers" code={supplier?.code ?? ""} name={supplier?.name} disabled={readOnly} required
            onSelect={(item) => { setSupplier(item); markDirty(); }} onClear={() => setSupplier(null)} />
          <LookupFieldInput label={t("purchase:common.warehouse")} type="warehouses" code={warehouse?.code ?? ""} name={warehouse?.name} disabled={readOnly} required
            onSelect={(item) => { setWarehouse(item); markDirty(); }} onClear={() => setWarehouse(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:common.orderDate")}</Label>
            <Input type="date" value={orderDate} disabled={readOnly} onChange={(e) => { setOrderDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:common.expectedDate")}</Label>
            <Input type="date" value={expectedDate} disabled={readOnly} onChange={(e) => { setExpectedDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:common.currency")}</Label>
            <Input value={currency} disabled={readOnly} onChange={(e) => { setCurrency(e.target.value.toUpperCase()); markDirty(); }} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:common.notes")}</Label>
            <Textarea value={notes} disabled={readOnly} onChange={(e) => { setNotes(e.target.value); markDirty(); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <EditableLineGrid columns={columns} rows={lines} onRowsChange={(next) => { setLines(next); markDirty(); }} readOnly={readOnly} makeEmptyRow={makeEmptyLine} />
        </CardContent>
      </Card>

      <LookupDialog type="purchase-orders" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      {dialog}
    </div>
  );
}

function ItemCell({ row, readOnly, onChange }: { row: LineRow; readOnly?: boolean; onChange: (next: LineRow) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-w-[14rem] items-center gap-2">
      <Input readOnly className="h-9 w-24 font-mono" value={row.itemCode} placeholder="—" onClick={() => !readOnly && setOpen(true)} disabled={readOnly} />
      <span className="truncate text-sm text-muted-foreground">{row.itemName}</span>
      <LookupDialog type="items" open={open} onOpenChange={setOpen}
        onSelect={(item) => onChange({ ...row, itemId: item.id ?? "", itemCode: item.code, itemName: item.name, _status: row._status === "unchanged" ? "update" : row._status })} />
    </div>
  );
}
