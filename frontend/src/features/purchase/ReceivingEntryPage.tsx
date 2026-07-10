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

interface PurchaseOrderDetail {
  id: string;
  supplierId: string;
  supplierName?: string | null;
  warehouseId: string;
  warehouseCode?: string | null;
  lines: { id?: string; lineNumber: number; itemId: string; itemSku?: string | null; itemName?: string | null; unitPrice: number; quantityOpen: number }[];
}

interface GoodsReceiptLineDto {
  id?: string;
  lineNumber: number;
  purchaseOrderLineId?: string | null;
  itemId: string;
  itemSku?: string | null;
  itemName?: string | null;
  locationId?: string | null;
  quantity: number;
  unitCost: number;
  batchOrSerial?: string | null;
  expiryDate?: string | null;
}

interface GoodsReceiptDto {
  id: string;
  number: string;
  status: number;
  purchaseOrderId?: string | null;
  purchaseOrderNumber?: string | null;
  supplierId: string;
  supplierName?: string | null;
  warehouseId: string;
  warehouseCode?: string | null;
  receivedAt: string;
  supplierDeliveryNote?: string | null;
  notes?: string | null;
  lines: GoodsReceiptLineDto[];
}

interface LineRow extends EditableLineRow {
  purchaseOrderLineId?: string | null;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitCost: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return { lineNumber, _status: "insert", itemId: "", itemCode: "", itemName: "", quantity: 0, unitCost: 0 };
}

/** Receiving Entry (GRN/BPB) — legacy `frmPurchaseReceive` (ObjType 32). See docs/modules/purchase/prds/receiving-entry.md. */
export function ReceivingEntryPage() {
  const { t } = useTranslation(["purchase", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [poLookupOpen, setPoLookupOpen] = useState(false);
  const [sourcePo, setSourcePo] = useState<{ id: string; number: string } | null>(null);
  const [supplier, setSupplier] = useState<LookupItem | null>(null);
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [deliveryNote, setDeliveryNote] = useState("");
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
    setSourcePo(null);
    setSupplier(null);
    setWarehouse(null);
    setReceivedAt(new Date().toISOString().slice(0, 10));
    setDeliveryNote("");
    setNotes("");
    setLines([]);
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: GoodsReceiptDto) => {
    setDocId(dto.id);
    setSourcePo(dto.purchaseOrderId ? { id: dto.purchaseOrderId, number: dto.purchaseOrderNumber ?? "" } : null);
    setSupplier({ id: dto.supplierId, code: "", name: dto.supplierName ?? "" });
    setWarehouse({ id: dto.warehouseId, code: dto.warehouseCode ?? "", name: "" });
    setReceivedAt(dto.receivedAt.slice(0, 10));
    setDeliveryNote(dto.supplierDeliveryNote ?? "");
    setNotes(dto.notes ?? "");
    setLines(dto.lines.map((l) => ({
      id: l.id, lineNumber: l.lineNumber, _status: "unchanged", purchaseOrderLineId: l.purchaseOrderLineId,
      itemId: l.itemId, itemCode: l.itemSku ?? "", itemName: l.itemName ?? "", quantity: l.quantity, unitCost: l.unitCost,
    })));
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`inbound/grns/${id}`).json<GoodsReceiptDto>()), [loadDoc]);

  const pullFromPo = useCallback(async (item: LookupItem) => {
    if (!item.id) return;
    const po = await api.get(`inbound/purchase-orders/${item.id}`).json<PurchaseOrderDetail>();
    setSourcePo({ id: po.id, number: item.code });
    setSupplier({ id: po.supplierId, code: "", name: po.supplierName ?? "" });
    setWarehouse({ id: po.warehouseId, code: po.warehouseCode ?? "", name: "" });
    setLines(
      po.lines.filter((l) => l.quantityOpen > 0).map((l, idx) => ({
        lineNumber: idx + 1, _status: "insert" as const, purchaseOrderLineId: l.id ?? null,
        itemId: l.itemId, itemCode: l.itemSku ?? "", itemName: l.itemName ?? "", quantity: l.quantityOpen, unitCost: l.unitPrice,
      })),
    );
    markDirty();
  }, [markDirty]);

  const buildPayload = useCallback(
    () => ({
      purchaseOrderId: sourcePo?.id ?? null,
      supplierId: supplier?.id,
      warehouseId: warehouse?.id,
      receivedAt: receivedAt ? new Date(receivedAt).toISOString() : null,
      supplierDeliveryNote: deliveryNote || null,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber, purchaseOrderLineId: l.purchaseOrderLineId ?? null, itemId: l.itemId,
        locationId: null, quantity: l.quantity, unitCost: l.unitCost, batchOrSerial: null, expiryDate: null,
      })),
    }),
    [sourcePo, supplier, warehouse, receivedAt, deliveryNote, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.supplierId || !payload.warehouseId) throw new Error(t("common:required"));
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));
      if (isNew) loadDoc(await api.post("inbound/grns", { json: payload }).json<GoodsReceiptDto>());
      else {
        await api.put(`inbound/grns/${docId}`, { json: payload });
        await openDoc(docId!);
      }
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`inbound/grns/${docId}/post`);
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
        cell: ({ row }) => (
          <div className="flex min-w-[14rem] items-center gap-2">
            <Input readOnly className="h-9 w-24 font-mono" value={row.original.itemCode} disabled />
            <span className="truncate text-sm text-muted-foreground">{row.original.itemName}</span>
          </div>
        ),
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
        accessorKey: "unitCost",
        header: t("purchase:common.unitCost"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-28" value={row.original.unitCost} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, unitCost: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
    ],
    [t, readOnly, markDirty],
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("purchase:receiving.title")}</h1>
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
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:receiving.sourceOrder")}</Label>
            <div className="flex items-center gap-2">
              <Input readOnly value={sourcePo?.number ?? ""} placeholder="—" className="w-40 font-mono" disabled={readOnly} />
              <button type="button" className="text-sm font-semibold text-primary underline disabled:opacity-50" disabled={readOnly} onClick={() => setPoLookupOpen(true)}>
                {t("purchase:receiving.pullFromPo")}
              </button>
            </div>
          </div>
          <LookupFieldInput label={t("purchase:common.supplier")} type="suppliers" code={supplier?.code ?? ""} name={supplier?.name} disabled={readOnly} required
            onSelect={(item) => { setSupplier(item); markDirty(); }} onClear={() => setSupplier(null)} />
          <LookupFieldInput label={t("purchase:common.warehouse")} type="warehouses" code={warehouse?.code ?? ""} name={warehouse?.name} disabled={readOnly} required
            onSelect={(item) => { setWarehouse(item); markDirty(); }} onClear={() => setWarehouse(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:receiving.receivedAt")}</Label>
            <Input type="date" value={receivedAt} disabled={readOnly} onChange={(e) => { setReceivedAt(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("purchase:receiving.deliveryNote")}</Label>
            <Input value={deliveryNote} disabled={readOnly} onChange={(e) => { setDeliveryNote(e.target.value); markDirty(); }} />
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

      <LookupDialog type="grns" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      <LookupDialog type="purchase-orders" open={poLookupOpen} onOpenChange={setPoLookupOpen} onSelect={pullFromPo} />
      {dialog}
    </div>
  );
}
