import { PaymentReceiptForm } from "#/features/ar/PaymentReceiptForm";

/** Payment Receipt — legacy `frmPaymentReceipt` (6 allocation types). See docs/modules/ar/prds/payment-receipt.md. */
export function PaymentReceiptPage() {
  return <PaymentReceiptForm titleKey="ar:paymentReceipt.title" homeRoute="/ar" />;
}
