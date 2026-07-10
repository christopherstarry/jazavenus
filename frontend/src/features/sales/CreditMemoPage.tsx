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

interface CreditMemoLineDto {
  id?: string;
  lineNumber: number;
  itemId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

interface CreditMemoDto {
  id: string;
  number: string;
  division: string;
  status: number;
  customerId: string;
  customerName?: string | null;
  salesReturnId?: string | null;
  salesReturnNumber?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  issueDate: string;
  currency: string;
  taxSerial?: string | null;
  notes?: string | null;
  lines: CreditMemoLineDto[];
}

interface LineRow extends EditableLineRow {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return { lineNumber, _status: "insert", itemId: "", description: "", quantity: 0, unitPrice: 0, discountPercent: 0, taxPercent: 0 };
}

/** Credit Memo — legacy `frmCreditMemo` (ObjType 37). See docs/modules/sales/prds/credit-memo.md. */
export function CreditMemoPage() {
  const { t } = useTranslation(["sales", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [docId, setDocId] = useState<string | null>(null);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [sourceReturn, setSourceReturn] = useState<LookupItem | null>(null);
  const [sourceInvoice, setSourceInvoice] = useState<LookupItem | null>(null);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("IDR");
  const [taxSerial, setTaxSerial] = useState("");
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
    setCustomer(null);
    setSourceReturn(null);
    setSourceInvoice(null);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setCurrency("IDR");
    setTaxSerial("");
    setNotes("");
    setLines([]);
    setStatus(DocumentStatus.Draft);
    setDocNumber(null);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: CreditMemoDto) => {
    setDocId(dto.id);
    setCustomer({ id: dto.customerId, code: "", name: dto.customerName ?? "" });
    setSourceReturn(dto.salesReturnId ? { id: dto.salesReturnId, code: dto.salesReturnNumber ?? "", name: "" } : null);
    setSourceInvoice(dto.invoiceId ? { id: dto.invoiceId, code: dto.invoiceNumber ?? "", name: "" } : null);
    setIssueDate(dto.issueDate.slice(0, 10));
    setCurrency(dto.currency);
    setTaxSerial(dto.taxSerial ?? "");
    setNotes(dto.notes ?? "");
    setLines(
      dto.lines.map((l) => ({
        id: l.id,
        lineNumber: l.lineNumber,
        _status: "unchanged",
        itemId: l.itemId ?? "",
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
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`invoices/credit-memos/${id}`).json<CreditMemoDto>()), [loadDoc]);

  const buildPayload = useCallback(
    () => ({
      customerId: customer?.id,
      salesReturnId: sourceReturn?.id ?? null,
      invoiceId: sourceInvoice?.id ?? null,
      issueDate: issueDate ? new Date(issueDate).toISOString() : null,
      currency,
      taxSerial: taxSerial || null,
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
    [customer, sourceReturn, sourceInvoice, issueDate, currency, taxSerial, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.customerId) throw new Error(t("common:required"));
      if (payload.lines.length === 0) throw new Error(t("grid:noLines"));
      if (isNew) loadDoc(await api.post("invoices/credit-memos", { json: payload }).json<CreditMemoDto>());
      else {
        await api.put(`invoices/credit-memos/${docId}`, { json: payload });
        await openDoc(docId!);
      }
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`invoices/credit-memos/${docId}/post`);
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
        header: t("sales:creditMemo.description"),
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
        <h1 className="text-lg font-bold">{t("sales:creditMemo.title")}</h1>
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
        onClose={() => navigate("/sales")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("sales:common.customer")} type="customers" code={customer?.code ?? ""} name={customer?.name} disabled={readOnly} required
            onSelect={(item) => { setCustomer(item); markDirty(); }} onClear={() => setCustomer(null)} />
          <LookupFieldInput label={t("sales:creditMemo.sourceReturn")} type="sales-returns" code={sourceReturn?.code ?? ""} name={sourceReturn?.name} disabled={readOnly}
            onSelect={(item) => { setSourceReturn(item); markDirty(); }} onClear={() => setSourceReturn(null)} />
          <LookupFieldInput label={t("sales:creditMemo.sourceInvoice")} type="invoices" code={sourceInvoice?.code ?? ""} name={sourceInvoice?.name} disabled={readOnly}
            onSelect={(item) => { setSourceInvoice(item); markDirty(); }} onClear={() => setSourceInvoice(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:creditMemo.issueDate")}</Label>
            <Input type="date" value={issueDate} disabled={readOnly} onChange={(e) => { setIssueDate(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("sales:creditMemo.taxSerial")}</Label>
            <Input value={taxSerial} disabled={readOnly} onChange={(e) => { setTaxSerial(e.target.value); markDirty(); }} />
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

      <LookupDialog type="credit-memos" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      {dialog}
    </div>
  );
}
