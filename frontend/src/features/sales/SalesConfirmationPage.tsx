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
import "#/features/sales/salesI18n";

const DocumentStatus = { Draft: 0, Posted: 10, Voided: 90 } as const;

interface SalesOrderDetail {
  id: string;
  customerId: string;
  customerName?: string | null;
  warehouseId: string;
  warehouseCode?: string | null;
  lines: { id?: string; lineNumber: number; itemId: string; itemSku?: string | null; itemName?: string | null; quantityOpen: number }[];
}

interface DeliveryOrderLineDto {
  id?: string;
  lineNumber: number;
  salesOrderLineId?: string | null;
  itemId: string;
  itemSku?: string | null;
  itemName?: string | null;
  locationId?: string | null;
  quantity: number;
  unitCost: number;
}

interface DeliveryOrderDto {
  id: string;
  number: string;
  status: number;
  salesOrderId?: string | null;
  salesOrderNumber?: string | null;
  customerId: string;
  customerName?: string | null;
  warehouseId: string;
  warehouseCode?: string | null;
  deliveredAt: string;
  notes?: string | null;
  lines: DeliveryOrderLineDto[];
}

interface LineRow extends EditableLineRow {
  salesOrderLineId?: string | null;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return { lineNumber, _status: "insert", itemId: "", itemCode: "", itemName: "", quantity: 0 };
}

/** Sales Confirmation (Delivery) — legacy `frmDelivery` (ObjType 28). See docs/modules/sales/prds/sales-confirmation.md. */
export function SalesConfirmationPage() {
  const { t } = useTranslation(["sales", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [soLookupOpen, setSoLookupOpen] = useState(false);

  const [sourceSo, setSourceSo] = useState<{ id: string; number: string } | null>(null);
  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [deliveredAt, setDeliveredAt] = useState(() => new Date().toISOString().slice(0, 10));
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
    setSourceSo(null);
    setCustomer(null);
    setWarehouse(null);
    setDeliveredAt(new Date().toISOString().slice(0, 10));
    setNotes("");
    setLines([]);
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: DeliveryOrderDto) => {
    setDocId(dto.id);
    setSourceSo(dto.salesOrderId ? { id: dto.salesOrderId, number: dto.salesOrderNumber ?? "" } : null);
    setCustomer({ id: dto.customerId, code: "", name: dto.customerName ?? "" });
    setWarehouse({ id: dto.warehouseId, code: dto.warehouseCode ?? "", name: "" });
    setDeliveredAt(dto.deliveredAt.slice(0, 10));
    setNotes(dto.notes ?? "");
    setLines(
      dto.lines.map((l) => ({
        id: l.id,
        lineNumber: l.lineNumber,
        _status: "unchanged",
        salesOrderLineId: l.salesOrderLineId,
        itemId: l.itemId,
        itemCode: l.itemSku ?? "",
        itemName: l.itemName ?? "",
        quantity: l.quantity,
      })),
    );
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
  }, []);

  const openDoc = useCallback(
    async (id: string) => {
      const dto = await api.get(`outbound/delivery-orders/${id}`).json<DeliveryOrderDto>();
      loadDoc(dto);
    },
    [loadDoc],
  );

  const pullFromSo = useCallback(async (item: LookupItem) => {
    if (!item.id) return;
    const so = await api.get(`outbound/sales-orders/${item.id}`).json<SalesOrderDetail>();
    setSourceSo({ id: so.id, number: item.code });
    setCustomer({ id: so.customerId, code: "", name: so.customerName ?? "" });
    setWarehouse({ id: so.warehouseId, code: so.warehouseCode ?? "", name: "" });
    setLines(
      so.lines
        .filter((l) => l.quantityOpen > 0)
        .map((l, idx) => ({
          lineNumber: idx + 1,
          _status: "insert" as const,
          salesOrderLineId: l.id ?? null,
          itemId: l.itemId,
          itemCode: l.itemSku ?? "",
          itemName: l.itemName ?? "",
          quantity: l.quantityOpen,
        })),
    );
    markDirty();
  }, [markDirty]);

  const buildPayload = useCallback(
    () => ({
      salesOrderId: sourceSo?.id ?? null,
      customerId: customer?.id,
      warehouseId: warehouse?.id,
      deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : null,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber,
        salesOrderLineId: l.salesOrderLineId ?? null,
        itemId: l.itemId,
        locationId: null,
        quantity: l.quantity,
      })),
    }),
    [sourceSo, customer, warehouse, deliveredAt, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.customerId || !payload.warehouseId) throw new Error(t("common:required"));
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));
      if (isNew) {
        const dto = await api.post("outbound/delivery-orders", { json: payload }).json<DeliveryOrderDto>();
        loadDoc(dto);
      } else {
        await api.put(`outbound/delivery-orders/${docId}`, { json: payload });
        await openDoc(docId!);
      }
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`outbound/delivery-orders/${docId}/post`);
      await openDoc(docId!);
    },
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const voidMutation = useMutation({
    mutationFn: async () => {
      await api.post(`outbound/delivery-orders/${docId}/void`);
      await openDoc(docId!);
    },
    onSuccess: () => toast({ title: t("dialog:deleteSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleSave = useCallback(async () => {
    if (!isNew) {
      const ok = await confirm({ title: t("dialog:confirmSave"), description: "" });
      if (!ok) return;
    }
    saveMutation.mutate();
  }, [isNew, confirm, saveMutation, t]);

  const handleDelete = useCallback(async () => {
    if (isNew) return;
    const ok = await confirm({ title: isPosted ? t("dialog:confirmDelete") : t("dialog:confirmDelete"), description: docNumber ?? "", destructive: true });
    if (!ok) return;
    if (isPosted) voidMutation.mutate();
  }, [isNew, isPosted, confirm, voidMutation, docNumber, t]);

  const handleNew = useCallback(async () => {
    if (dirty) {
      const ok = await confirm({ title: t("sales:common.newDocPrompt"), description: "" });
      if (!ok) return;
    }
    resetForm();
  }, [dirty, confirm, resetForm, t]);

  useLegacyShortcuts({
    onNew: handleNew,
    onSave: !readOnly ? handleSave : undefined,
    onDelete: !readOnly && !isNew ? handleDelete : undefined,
    onUndo: isNew ? resetForm : undefined,
    onBrowse: () => setBrowseOpen(true),
    onExecute: formState === "normal" ? () => postMutation.mutate() : undefined,
    onClose: () => navigate("/sales"),
  });

  const columns = useMemo<ColumnDef<LineRow>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: t("sales:common.item"),
        cell: ({ row }) => (
          <div className="flex min-w-[14rem] items-center gap-2">
            <Input readOnly className="h-9 w-24 font-mono" value={row.original.itemCode} disabled />
            <span className="truncate text-sm text-muted-foreground">{row.original.itemName}</span>
          </div>
        ),
      },
      {
        accessorKey: "quantity",
        header: t("sales:common.qty"),
        cell: ({ row }) => (
          <Input
            type="number"
            className="h-9 w-24"
            value={row.original.quantity}
            disabled={readOnly}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, quantity: v, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
    ],
    [t, readOnly, markDirty],
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("sales:salesConfirmation.title")}</h1>
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
        onDelete={handleDelete}
        onUndo={resetForm}
        onExecute={() => postMutation.mutate()}
        onClose={() => navigate("/sales")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("sales:salesConfirmation.sourceOrder")}</Label>
            <div className="flex items-center gap-2">
              <Input readOnly value={sourceSo?.number ?? ""} placeholder="—" className="w-40 font-mono" disabled={readOnly} />
              <button
                type="button"
                className="text-sm font-semibold text-primary underline disabled:opacity-50"
                disabled={readOnly}
                onClick={() => setSoLookupOpen(true)}
              >
                {t("sales:salesConfirmation.pullFromSo")}
              </button>
            </div>
          </div>
          <LookupFieldInput
            label={t("sales:common.customer")}
            type="customers"
            code={customer?.code ?? ""}
            name={customer?.name}
            disabled={readOnly}
            required
            onSelect={(item) => { setCustomer(item); markDirty(); }}
            onClear={() => setCustomer(null)}
          />
          <LookupFieldInput
            label={t("sales:common.warehouse")}
            type="warehouses"
            code={warehouse?.code ?? ""}
            name={warehouse?.name}
            disabled={readOnly}
            required
            onSelect={(item) => { setWarehouse(item); markDirty(); }}
            onClear={() => setWarehouse(null)}
          />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:salesConfirmation.deliveredAt")}</Label>
            <Input type="date" value={deliveredAt} disabled={readOnly} onChange={(e) => { setDeliveredAt(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("sales:common.notes")}</Label>
            <Textarea value={notes} disabled={readOnly} onChange={(e) => { setNotes(e.target.value); markDirty(); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <EditableLineGrid
            columns={columns}
            rows={lines}
            onRowsChange={(next) => { setLines(next); markDirty(); }}
            readOnly={readOnly}
            makeEmptyRow={makeEmptyLine}
          />
        </CardContent>
      </Card>

      <LookupDialog type="delivery-orders" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      <LookupDialog type="sales-orders" open={soLookupOpen} onOpenChange={setSoLookupOpen} onSelect={pullFromSo} />

      {dialog}
    </div>
  );
}
