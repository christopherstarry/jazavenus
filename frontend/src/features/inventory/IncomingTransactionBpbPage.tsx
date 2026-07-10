import { StockDocumentPage } from "#/features/inventory/StockDocumentPage";

/** Incoming Transaction (BPB) — legacy `frmGoodReceipt` (ObjType 36). See docs/modules/inventory/prds/incoming-bpb.md. */
export function IncomingTransactionBpbPage() {
  return (
    <StockDocumentPage
      resource="stock-receipts"
      dateField="receiptDate"
      lookupType="stock-receipts"
      titleKey="inventory:bpb.title"
      homeRoute="/inventory"
    />
  );
}
