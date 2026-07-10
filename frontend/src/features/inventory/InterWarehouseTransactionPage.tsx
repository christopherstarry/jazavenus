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
import "#/features/inventory/inventoryI18n";

const DocumentStatus = { Draft: 0, Posted: 10, Voided: 90 } as const;

interface StockTransferLineDto {
  id?: string;
  lineNumber: number;
  itemId: string;
  itemSku?: string | null;
  itemName?: string | null;
  quantity: number;
}

interface StockTransferDto {
  id: string;
  number: string;
  division: string;
  status: number;
  fromWarehouseId: string;
  fromWarehouseCode?: string | null;
  toWarehouseId: string;
  toWarehouseCode?: string | null;
  transferDate: string;
  notes?: string | null;
  lines: StockTransferLineDto[];
}

interface LineRow extends EditableLineRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return { lineNumber, _status: "insert", itemId: "", itemCode: "", itemName: "", quantity: 0 };
}

/** Inter-Warehouse Transfer — legacy `frmTransfer` (ObjType 34). See docs/modules/inventory/prds/inter-warehouse-transfer.md. */
export function InterWarehouseTransactionPage() {
  const { t } = useTranslation(["inventory", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [fromWarehouse, setFromWarehouse] = useState<LookupItem | null>(null);
  const [toWarehouse, setToWarehouse] = useState<LookupItem | null>(null);
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
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
    setFromWarehouse(null);
    setToWarehouse(null);
    setTransferDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setLines([]);
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: StockTransferDto) => {
    setDocId(dto.id);
    setFromWarehouse({ id: dto.fromWarehouseId, code: dto.fromWarehouseCode ?? "", name: "" });
    setToWarehouse({ id: dto.toWarehouseId, code: dto.toWarehouseCode ?? "", name: "" });
    setTransferDate(dto.transferDate.slice(0, 10));
    setNotes(dto.notes ?? "");
    setLines(dto.lines.map((l) => ({
      id: l.id, lineNumber: l.lineNumber, _status: "unchanged", itemId: l.itemId,
      itemCode: l.itemSku ?? "", itemName: l.itemName ?? "", quantity: l.quantity,
    })));
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`inventory/stock-transfers/${id}`).json<StockTransferDto>()), [loadDoc]);

  const buildPayload = useCallback(
    () => ({
      fromWarehouseId: fromWarehouse?.id,
      toWarehouseId: toWarehouse?.id,
      transferDate: transferDate ? new Date(transferDate).toISOString() : null,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber, itemId: l.itemId, fromLocationId: null, toLocationId: null, quantity: l.quantity,
      })),
    }),
    [fromWarehouse, toWarehouse, transferDate, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.fromWarehouseId || !payload.toWarehouseId) throw new Error(t("common:required"));
      if (payload.fromWarehouseId === payload.toWarehouseId) throw new Error(t("common:required"));
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));
      if (isNew) loadDoc(await api.post("inventory/stock-transfers", { json: payload }).json<StockTransferDto>());
      else {
        await api.put(`inventory/stock-transfers/${docId}`, { json: payload });
        await openDoc(docId!);
      }
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`inventory/stock-transfers/${docId}/post`);
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
      const ok = await confirm({ title: t("inventory:common.newDocPrompt"), description: "" });
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
    onClose: () => navigate("/inventory"),
  });

  const columns = useMemo<ColumnDef<LineRow>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: t("inventory:common.item"),
        cell: ({ row }) => <ItemCell row={row.original} readOnly={readOnly} onChange={(next) => { setLines((prev) => prev.map((l, i) => (i === row.index ? next : l))); markDirty(); }} />,
      },
      {
        accessorKey: "quantity",
        header: t("inventory:common.qty"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-24" value={row.original.quantity} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, quantity: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
    ],
    [t, readOnly, markDirty],
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("inventory:transfer.title")}</h1>
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
        onClose={() => navigate("/inventory")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("inventory:common.fromWarehouse")} type="warehouses" code={fromWarehouse?.code ?? ""} name={fromWarehouse?.name} disabled={readOnly} required
            onSelect={(item) => { setFromWarehouse(item); markDirty(); }} onClear={() => setFromWarehouse(null)} />
          <LookupFieldInput label={t("inventory:common.toWarehouse")} type="warehouses" code={toWarehouse?.code ?? ""} name={toWarehouse?.name} disabled={readOnly} required
            onSelect={(item) => { setToWarehouse(item); markDirty(); }} onClear={() => setToWarehouse(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("inventory:common.date")}</Label>
            <Input type="date" value={transferDate} disabled={readOnly} onChange={(e) => { setTransferDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("inventory:common.notes")}</Label>
            <Textarea value={notes} disabled={readOnly} onChange={(e) => { setNotes(e.target.value); markDirty(); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <EditableLineGrid columns={columns} rows={lines} onRowsChange={(next) => { setLines(next); markDirty(); }} readOnly={readOnly} makeEmptyRow={makeEmptyLine} />
        </CardContent>
      </Card>

      <LookupDialog type="stock-transfers" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
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
