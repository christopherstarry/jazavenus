import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Card, CardContent } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar } from "#/features/common/LegacyTransactionToolbar";
import { LookupFieldInput } from "#/features/common/LookupFieldInput";
import type { LookupItem } from "#/features/common/LookupDialog";
import "#/features/ar/arI18n";

/** Jaza.Domain.Invoicing.PaymentMethod values as serialized by System.Text.Json. */
const PaymentMethod = { Cash: 1, BankTransfer: 2, Card: 3, Cheque: 4, Other: 99 } as const;

interface InvoiceDto {
  id: string;
  number: string;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
}

interface OpenInvoiceRow {
  invoiceId: string;
  number: string;
  outstanding: number;
  applied: number;
}

export interface PaymentReceiptFormProps {
  titleKey: string;
  /** Locks the payment method to a single value (e.g. Bank Transfer screen) — hides the selector. */
  fixedMethod?: number;
  homeRoute: string;
}

/**
 * Shared batch payment receipt form — legacy `frmPaymentReceipt`. `POST /api/ar/payments` is a
 * single-shot batch action (no draft/save lifecycle), so the toolbar only exposes New (reset) and
 * Execute (submit). See docs/modules/ar/prds/payment-receipt.md and bank-transfer.md.
 */
export function PaymentReceiptForm({ titleKey, fixedMethod, homeRoute }: PaymentReceiptFormProps) {
  const { t } = useTranslation(["ar", "dialog"]);
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<LookupItem | null>(null);
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<number>(fixedMethod ?? PaymentMethod.BankTransfer);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<OpenInvoiceRow[]>([]);

  const invoicesQuery = useQuery({
    queryKey: ["ar-open-invoices", customer?.id],
    queryFn: () =>
      api
        .get("invoices", { searchParams: { customerId: customer!.id!, outstandingOnly: true, pageSize: 50 } })
        .json<{ items: InvoiceDto[] }>(),
    enabled: !!customer?.id,
  });

  const onCustomerSelect = useCallback((item: LookupItem) => {
    setCustomer(item);
    setRows([]);
  }, []);

  const invoiceRows = invoicesQuery.data?.items ?? [];
  const displayRows: OpenInvoiceRow[] = invoiceRows.map((inv) => {
    const existing = rows.find((r) => r.invoiceId === inv.id);
    return existing ?? { invoiceId: inv.id, number: inv.number, outstanding: inv.amountDue, applied: 0 };
  });

  const updateApplied = useCallback(
    (invoiceId: string, value: number) => {
      setRows(displayRows.map((r) => (r.invoiceId === invoiceId ? { ...r, applied: value } : r)));
    },
    [displayRows],
  );

  const totalApplied = useMemo(() => displayRows.reduce((sum, r) => sum + (r.applied || 0), 0), [displayRows]);

  const resetForm = useCallback(() => {
    setCustomer(null);
    setReceivedAt(new Date().toISOString().slice(0, 10));
    setMethod(fixedMethod ?? PaymentMethod.BankTransfer);
    setReference("");
    setNotes("");
    setRows([]);
  }, [fixedMethod]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const allocations = displayRows.filter((r) => r.applied > 0).map((r) => ({ invoiceId: r.invoiceId, amount: r.applied, notes: null }));
      if (!customer?.id) throw new Error(t("common:required"));
      if (allocations.length === 0) throw new Error(t("grid:noLines"));
      await api.post("ar/payments", {
        json: {
          customerId: customer.id,
          receivedAt: new Date(receivedAt).toISOString(),
          method,
          currency: "IDR",
          reference: reference || null,
          notes: notes || null,
          allocations,
        },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      resetForm();
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <h1 className="text-lg font-bold">{t(titleKey)}</h1>

      <LegacyTransactionToolbar
        mode="transaction"
        formState={customer ? "insert" : "init"}
        canEdit
        canDelete={false}
        isDirty={!!customer}
        isSaving={submitMutation.isPending}
        onNew={resetForm}
        onSave={() => submitMutation.mutate()}
        onUndo={resetForm}
        onClose={() => navigate(homeRoute)}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupFieldInput label={t("ar:common.customer")} type="customers" code={customer?.code ?? ""} name={customer?.name} required
            onSelect={onCustomerSelect} onClear={() => setCustomer(null)} />
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:common.receivedDate")}</Label>
            <Input type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
          </div>
          {!fixedMethod && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide">{t("ar:common.method")}</Label>
              <select
                value={method}
                onChange={(e) => setMethod(Number(e.target.value))}
                className="flex h-12 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base"
              >
                <option value={PaymentMethod.Cash}>{t("ar:paymentMethod.cash")}</option>
                <option value={PaymentMethod.BankTransfer}>{t("ar:paymentMethod.bankTransfer")}</option>
                <option value={PaymentMethod.Card}>{t("ar:paymentMethod.card")}</option>
                <option value={PaymentMethod.Cheque}>{t("ar:paymentMethod.cheque")}</option>
                <option value={PaymentMethod.Other}>{t("ar:paymentMethod.other")}</option>
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("ar:common.reference")}</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("ar:common.notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{t("ar:paymentReceipt.openInvoices")}</h2>
          {!customer ? (
            <p className="py-6 text-center text-muted-foreground">{t("ar:paymentReceipt.selectCustomerFirst")}</p>
          ) : displayRows.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">{t("ar:paymentReceipt.noInvoices")}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ar:paymentReceipt.invoice")}</TableHead>
                    <TableHead>{t("ar:paymentReceipt.outstanding")}</TableHead>
                    <TableHead>{t("ar:paymentReceipt.applied")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((r) => (
                    <TableRow key={r.invoiceId}>
                      <TableCell className="font-mono">{r.number}</TableCell>
                      <TableCell className="font-mono">{r.outstanding.toLocaleString()}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-9 w-32"
                          value={r.applied}
                          max={r.outstanding}
                          onChange={(e) => updateApplied(r.invoiceId, Number(e.target.value))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-3 text-right text-base font-bold">
                {t("ar:paymentReceipt.totalApplied")}: <span className="font-mono">{totalApplied.toLocaleString()}</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
