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
import { runWithBusinessRuleConfirm } from "#/features/common/businessRuleFlow";
import "#/features/sales/salesI18n";

/** Jaza.Domain.Invoicing.Invoice.InvoiceStatus values as serialized by System.Text.Json. */
const InvoiceStatus = { Draft: 0, Posted: 10, PartiallyPaid: 20, Paid: 30, Voided: 90 } as const;

interface InvoiceLineDto {
  id?: string;
  lineNumber: number;
  itemId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

interface InvoiceDto {
  id: string;
  number: string;
  status: number;
  customerId: string;
  customerName?: string | null;
  deliveryOrderId?: string | null;
  deliveryOrderNumber?: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes?: string | null;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  lines: InvoiceLineDto[];
}

interface LineRow extends EditableLineRow {
  itemId: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return { lineNumber, _status: "insert", itemId: "", itemCode: "", description: "", quantity: 0, unitPrice: 0, discountPercent: 0, taxPercent: 0 };
}

/** Invoicing Process — legacy `frmInvoice`/`frmARInvoice` (ObjType 30). See docs/modules/sales/prds/invoicing-process.md. */
export function InvoicingProcessPage() {
  const { t } = useTranslation(["sales", "dialog"]);
  const navigate = useNavigate();
  const { confirm, confirmBusinessRule, dialog, businessRuleDialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [sourceDelivery, setSourceDelivery] = useState<LookupItem | null>(null);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("IDR");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);
  const [status, setStatus] = useState<number>(InvoiceStatus.Draft);
  const [docNumber, setDocNumber] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [amountDue, setAmountDue] = useState(0);

  const isNew = docId === null;
  const isPosted = status !== InvoiceStatus.Draft && status !== InvoiceStatus.Voided;
  const readOnly = isPosted || status === InvoiceStatus.Voided;
  const formState: FormState = isNew ? (dirty ? "insert" : "init") : isPosted ? "posted" : status === InvoiceStatus.Voided ? "voided" : "normal";
  const markDirty = useCallback(() => setDirty(true), []);

  const resetForm = useCallback(() => {
    setDocId(null);
    setCustomer(null);
    setSourceDelivery(null);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate(new Date().toISOString().slice(0, 10));
    setCurrency("IDR");
    setNotes("");
    setLines([]);
    setStatus(InvoiceStatus.Draft);
    setDocNumber(null);
    setDirty(false);
    setAmountDue(0);
  }, []);

  const loadDoc = useCallback((dto: InvoiceDto) => {
    setDocId(dto.id);
    setCustomer({ id: dto.customerId, code: "", name: dto.customerName ?? "" });
    setSourceDelivery(dto.deliveryOrderId ? { id: dto.deliveryOrderId, code: dto.deliveryOrderNumber ?? "", name: "" } : null);
    setIssueDate(dto.issueDate.slice(0, 10));
    setDueDate(dto.dueDate.slice(0, 10));
    setCurrency(dto.currency);
    setNotes(dto.notes ?? "");
    setLines(
      dto.lines.map((l) => ({
        id: l.id,
        lineNumber: l.lineNumber,
        _status: "unchanged",
        itemId: l.itemId ?? "",
        itemCode: "",
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
      })),
    );
    setStatus(dto.status);
    setDocNumber(dto.number);
    setDirty(false);
    setAmountDue(dto.amountDue);
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`invoices/${id}`).json<InvoiceDto>()), [loadDoc]);

  const buildPayload = useCallback(
    () => ({
      customerId: customer?.id,
      deliveryOrderId: sourceDelivery?.id ?? null,
      issueDate: issueDate ? new Date(issueDate).toISOString() : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      currency,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber,
        itemId: l.itemId || null,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
      })),
    }),
    [customer, sourceDelivery, issueDate, dueDate, currency, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.customerId) throw new Error(t("common:required"));
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));
      const action = async () => {
        if (isNew) loadDoc(await api.post("invoices", { json: payload }).json<InvoiceDto>());
        else {
          await api.put(`invoices/${docId}`, { json: payload });
          await openDoc(docId!);
        }
      };
      const ok = await runWithBusinessRuleConfirm(action, { confirmBusinessRule, t });
      if (!ok) throw new Error("cancelled");
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => {
      if (err instanceof Error && err.message === "cancelled") return;
      toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" });
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`invoices/${docId}/post`);
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
      const ok = await confirm({ title: t("sales:common.newDocPrompt"), description: "" });
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
    onClose: () => navigate("/sales"),
  });

  const columns = useMemo<ColumnDef<LineRow>[]>(
    () => [
      {
        accessorKey: "description",
        header: t("sales:invoicing.description"),
        cell: ({ row }) => (
          <Input className="h-9 min-w-[12rem]" value={row.original.description} disabled={readOnly}
            onChange={(e) => { const v = e.target.value; setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, description: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
      {
        accessorKey: "quantity",
        header: t("sales:common.qty"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-24" value={row.original.quantity} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, quantity: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
      {
        accessorKey: "unitPrice",
        header: t("sales:common.unitPrice"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-28" value={row.original.unitPrice} disabled={readOnly}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, unitPrice: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
    ],
    [t, readOnly, markDirty],
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("sales:invoicing.title")}</h1>
        <div className="flex items-center gap-2">
          {amountDue > 0 && !isNew && <Badge tone="warning">{t("common:total")}: {amountDue.toLocaleString()}</Badge>}
          {docNumber && <Badge tone={isPosted ? "success" : status === InvoiceStatus.Voided ? "destructive" : "neutral"}>{docNumber}</Badge>}
        </div>
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
        onPrint={docId ? () => window.open(`/api/invoices/${docId}/pdf`, "_blank") : undefined}
        onClose={() => navigate("/sales")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("sales:common.customer")} type="customers" code={customer?.code ?? ""} name={customer?.name} disabled={readOnly} required
            onSelect={(item) => { setCustomer(item); markDirty(); }} onClear={() => setCustomer(null)} />
          <LookupFieldInput label={t("sales:invoicing.sourceDelivery")} type="delivery-orders" code={sourceDelivery?.code ?? ""} name={sourceDelivery?.name} disabled={readOnly}
            onSelect={(item) => { setSourceDelivery(item); markDirty(); }} onClear={() => setSourceDelivery(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:invoicing.issueDate")}</Label>
            <Input type="date" value={issueDate} disabled={readOnly} onChange={(e) => { setIssueDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:invoicing.dueDate")}</Label>
            <Input type="date" value={dueDate} disabled={readOnly} onChange={(e) => { setDueDate(e.target.value); markDirty(); }} />
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
          <EditableLineGrid columns={columns} rows={lines} onRowsChange={(next) => { setLines(next); markDirty(); }} readOnly={readOnly} makeEmptyRow={makeEmptyLine} />
        </CardContent>
      </Card>

      <LookupDialog type="invoices" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      {dialog}
      {businessRuleDialog}
    </div>
  );
}
