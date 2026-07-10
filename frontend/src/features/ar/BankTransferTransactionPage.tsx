import { PaymentReceiptForm } from "#/features/ar/PaymentReceiptForm";

/** Jaza.Domain.Invoicing.PaymentMethod.BankTransfer */
const BANK_TRANSFER_METHOD = 2;

/** Bank Transfer Transaction — batch receipt scoped to Method=BankTransfer. See docs/modules/ar/prds/bank-transfer.md. */
export function BankTransferTransactionPage() {
  return <PaymentReceiptForm titleKey="ar:paymentReceipt.bankTransferTitle" fixedMethod={BANK_TRANSFER_METHOD} homeRoute="/ar" />;
}
