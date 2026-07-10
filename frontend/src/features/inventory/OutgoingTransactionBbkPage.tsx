import { StockDocumentPage } from "#/features/inventory/StockDocumentPage";

/** Outgoing Transaction (BBK) — legacy `frmGoodIssue` (ObjType 35). See docs/modules/inventory/prds/outgoing-bbk.md. */
export function OutgoingTransactionBbkPage() {
  return (
    <StockDocumentPage
      resource="stock-issues"
      dateField="issueDate"
      lookupType="stock-issues"
      titleKey="inventory:bbk.title"
      homeRoute="/inventory"
    />
  );
}
