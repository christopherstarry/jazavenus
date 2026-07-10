import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { runWithBusinessRuleConfirm } from "#/features/common/businessRuleFlow";
import "#/features/sales/salesI18n";

/** DocumentStatus enum values as serialized by System.Text.Json (Jaza.Domain.Common.DocumentStatus). */
const DocumentStatus = { Draft: 0, Posted: 10, Voided: 90 } as const;

interface SalesOrderLineDto {
  id?: string;
  lineNumber: number;
  itemId: string;
  itemSku?: string | null;
  itemName?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  quantityDelivered: number;
  quantityOpen: number;
}

interface SalesOrderDto {
  id: string;
  number: string;
  status: number;
  customerId: string;
  customerName?: string | null;
  warehouseId: string;
  warehouseCode?: string | null;
  orderDate: string;
  requestedDate?: string | null;
  currency: string;
  notes?: string | null;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  lines: SalesOrderLineDto[];
}

interface LineRow extends EditableLineRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  quantityDelivered: number;
}

function lineTotal(l: LineRow): number {
  const sub = l.quantity * l.unitPrice * (1 - l.discountPercent / 100);
  return sub + (sub * l.taxPercent) / 100;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return {
    lineNumber,
    _status: "insert",
    itemId: "",
    itemCode: "",
    itemName: "",
    quantity: 0,
    unitPrice: 0,
    discountPercent: 0,
    taxPercent: 0,
    quantityDelivered: 0,
  };
}

function dtoToRows(dto: SalesOrderDto): LineRow[] {
  return dto.lines.map((l) => ({
    id: l.id,
    lineNumber: l.lineNumber,
    _status: "unchanged",
    itemId: l.itemId,
    itemCode: l.itemSku ?? "",
    itemName: l.itemName ?? "",
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    discountPercent: l.discountPercent,
    taxPercent: l.taxPercent,
    quantityDelivered: l.quantityDelivered,
  }));
}

/**
 * Sales Order — legacy `frmOrderEntry` (ObjType 27). First fully API-wired gap screen; the
 * recipe (lookup + toolbar + grid + business-rule dialogs) is repeated for the other transaction
 * modules. See docs/modules/sales/prds/sales-order.md.
 */
export function SalesOrderPage() {
  const { t } = useTranslation(["sales", "dialog", "toolbar"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm, confirmBusinessRule, dialog, businessRuleDialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);

  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [warehouse, setWarehouse] = useState<LookupItem | null>(null);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [requestedDate, setRequestedDate] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);
  const [status, setStatus] = useState<number>(DocumentStatus.Draft);
  const [docNumber, setDocNumber] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [totals, setTotals] = useState({ subTotal: 0, taxTotal: 0, grandTotal: 0 });

  const isNew = docId === null;
  const formState: FormState = isNew ? (dirty ? "insert" : "init") : status === DocumentStatus.Posted ? "posted" : status === DocumentStatus.Voided ? "voided" : "normal";
  const isPosted = status === DocumentStatus.Posted;
  const readOnly = isPosted || status === DocumentStatus.Voided;

  const markDirty = useCallback(() => setDirty(true), []);

  const resetForm = useCallback(() => {
    setDocId(null);
    setCustomer(null);
    setWarehouse(null);
    setOrderDate(new Date().toISOString().slice(0, 10));
    setRequestedDate("");
    setCurrency("IDR");
    setNotes("");
    setLines([]);
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
    setTotals({ subTotal: 0, taxTotal: 0, grandTotal: 0 });
  }, []);

  const loadDoc = useCallback((dto: SalesOrderDto) => {
    setDocId(dto.id);
    setCustomer({ id: dto.customerId, code: "", name: dto.customerName ?? "" });
    setWarehouse({ id: dto.warehouseId, code: dto.warehouseCode ?? "", name: "" });
    setOrderDate(dto.orderDate.slice(0, 10));
    setRequestedDate(dto.requestedDate?.slice(0, 10) ?? "");
    setCurrency(dto.currency);
    setNotes(dto.notes ?? "");
    setLines(dtoToRows(dto));
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
    setTotals({ subTotal: dto.subTotal, taxTotal: dto.taxTotal, grandTotal: dto.grandTotal });
  }, []);

  const openDoc = useCallback(
    async (id: string) => {
      const dto = await api.get(`outbound/sales-orders/${id}`).json<SalesOrderDto>();
      loadDoc(dto);
      void queryClient.invalidateQueries({ queryKey: ["sales-order"] });
    },
    [loadDoc, queryClient],
  );

  const buildPayload = useCallback(
    () => ({
      customerId: customer?.id,
      warehouseId: warehouse?.id,
      orderDate: orderDate ? new Date(orderDate).toISOString() : null,
      requestedDate: requestedDate ? new Date(requestedDate).toISOString() : null,
      currency,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber,
        itemId: l.itemId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
      })),
    }),
    [customer, warehouse, orderDate, requestedDate, currency, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.customerId || !payload.warehouseId) throw new Error(t("common:required")); // top-level common.json
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));

      const action = async () => {
        if (isNew) {
          const dto = await api.post("outbound/sales-orders", { json: payload }).json<SalesOrderDto>();
          loadDoc(dto);
        } else {
          await api.put(`outbound/sales-orders/${docId}`, { json: payload });
          await openDoc(docId!);
        }
      };
      const ok = await runWithBusinessRuleConfirm(action, { confirmBusinessRule, t });
      if (!ok) throw new Error("cancelled");
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      void queryClient.invalidateQueries({ queryKey: ["lookup", "sales-orders"] });
    },
    onError: async (err) => {
      if (err instanceof Error && err.message === "cancelled") return;
      toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" });
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const action = async () => {
        await api.post(`outbound/sales-orders/${docId}/post`);
        await openDoc(docId!);
      };
      const ok = await runWithBusinessRuleConfirm(action, { confirmBusinessRule, t });
      if (!ok) throw new Error("cancelled");
    },
    onSuccess: () => toast({ title: t("dialog:postSuccess"), variant: "success" }),
    onError: async (err) => {
      if (err instanceof Error && err.message === "cancelled") return;
      toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (isPosted) await api.post(`outbound/sales-orders/${docId}/void`);
      else await api.delete(`outbound/sales-orders/${docId}`);
    },
    onSuccess: () => {
      toast({ title: t("dialog:deleteSuccess"), variant: "success" });
      resetForm();
    },
    onError: async (err) => {
      toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" });
    },
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
    const ok = await confirm({
      title: isPosted ? t("dialog:locked") : t("dialog:confirmDelete"),
      description: docNumber ?? "",
      destructive: true,
    });
    if (!ok) return;
    deleteMutation.mutate();
  }, [isNew, isPosted, confirm, deleteMutation, docNumber, t]);

  const handleUndo = useCallback(() => resetForm(), [resetForm]);

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
    onUndo: isNew ? handleUndo : undefined,
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
          <ItemCell
            row={row.original}
            readOnly={readOnly}
            onChange={(next) => {
              setLines((prev) => prev.map((l, i) => (i === row.index ? next : l)));
              markDirty();
            }}
          />
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
      {
        accessorKey: "unitPrice",
        header: t("sales:common.unitPrice"),
        cell: ({ row }) => (
          <Input
            type="number"
            className="h-9 w-28"
            value={row.original.unitPrice}
            disabled={readOnly}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, unitPrice: v, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
      {
        accessorKey: "discountPercent",
        header: t("sales:common.discPercent"),
        cell: ({ row }) => (
          <Input
            type="number"
            className="h-9 w-20"
            value={row.original.discountPercent}
            disabled={readOnly}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, discountPercent: v, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
      {
        accessorKey: "taxPercent",
        header: t("sales:common.taxPercent"),
        cell: ({ row }) => (
          <Input
            type="number"
            className="h-9 w-20"
            value={row.original.taxPercent}
            disabled={readOnly}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, taxPercent: v, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
      {
        id: "lineTotal",
        header: t("sales:common.lineTotal"),
        cell: ({ row }) => <span className="font-mono">{lineTotal(row.original).toLocaleString()}</span>,
      },
    ],
    [t, readOnly, markDirty],
  );

  const computedTotals = useMemo(() => {
    if (!isNew && !dirty) return totals;
    const subTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (1 - l.discountPercent / 100), 0);
    const taxTotal = lines.reduce((sum, l) => {
      const sub = l.quantity * l.unitPrice * (1 - l.discountPercent / 100);
      return sum + (sub * l.taxPercent) / 100;
    }, 0);
    return { subTotal, taxTotal, grandTotal: subTotal + taxTotal };
  }, [lines, isNew, dirty, totals]);

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("sales:salesOrder.title")}</h1>
        {docNumber && (
          <Badge tone={isPosted ? "success" : status === DocumentStatus.Voided ? "destructive" : "neutral"}>
            {docNumber}
          </Badge>
        )}
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
        onUndo={handleUndo}
        onExecute={() => postMutation.mutate()}
        onClose={() => navigate("/sales")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput
            label={t("sales:common.customer")}
            type="customers"
            code={customer?.code ?? ""}
            name={customer?.name}
            disabled={readOnly}
            required
            onSelect={(item) => {
              setCustomer(item);
              markDirty();
            }}
            onClear={() => setCustomer(null)}
          />
          <LookupFieldInput
            label={t("sales:common.warehouse")}
            type="warehouses"
            code={warehouse?.code ?? ""}
            name={warehouse?.name}
            disabled={readOnly}
            required
            onSelect={(item) => {
              setWarehouse(item);
              markDirty();
            }}
            onClear={() => setWarehouse(null)}
          />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:common.orderDate")}</Label>
            <Input type="date" value={orderDate} disabled={readOnly} onChange={(e) => { setOrderDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:common.requestedDate")}</Label>
            <Input type="date" value={requestedDate} disabled={readOnly} onChange={(e) => { setRequestedDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:common.currency")}</Label>
            <Input value={currency} disabled={readOnly} onChange={(e) => { setCurrency(e.target.value.toUpperCase()); markDirty(); }} />
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
            onRowsChange={(next) => {
              setLines(next);
              markDirty();
            }}
            readOnly={readOnly}
            makeEmptyRow={makeEmptyLine}
          />
          <div className="mt-4 flex flex-col items-end gap-1 border-t-2 pt-3 text-sm">
            <div className="flex w-56 justify-between"><span className="text-muted-foreground">{t("common:subtotal")}</span><span className="font-mono">{computedTotals.subTotal.toLocaleString()}</span></div>
            <div className="flex w-56 justify-between"><span className="text-muted-foreground">{t("common:tax")}</span><span className="font-mono">{computedTotals.taxTotal.toLocaleString()}</span></div>
            <div className="flex w-56 justify-between text-base font-bold"><span>{t("common:grandTotal")}</span><span className="font-mono">{computedTotals.grandTotal.toLocaleString()}</span></div>
          </div>
        </CardContent>
      </Card>

      <LookupDialog
        type="sales-orders"
        open={browseOpen}
        onOpenChange={setBrowseOpen}
        onSelect={(item) => {
          if (item.id) void openDoc(item.id);
        }}
      />

      {dialog}
      {businessRuleDialog}
    </div>
  );
}

function ItemCell({ row, readOnly, onChange }: { row: LineRow; readOnly?: boolean; onChange: (next: LineRow) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-w-[14rem] items-center gap-2">
      <Input
        readOnly
        className="h-9 w-24 font-mono"
        value={row.itemCode}
        placeholder="—"
        onClick={() => !readOnly && setOpen(true)}
        disabled={readOnly}
      />
      <span className="truncate text-sm text-muted-foreground">{row.itemName}</span>
      <LookupDialog
        type="items"
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) =>
          onChange({
            ...row,
            itemId: item.id ?? "",
            itemCode: item.code,
            itemName: item.name,
            _status: row._status === "unchanged" ? "update" : row._status,
          })
        }
      />
    </div>
  );
}
