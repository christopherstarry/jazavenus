# PRD: Receiving Entry (GRN / BPB)

## 1. Summary

Record stock received from suppliers against PO. Legacy `frmPurchaseReceive` (ObjType 32). Posts stock IN.

**Route:** `/purchase/receiving-entry`  
**Backend:** `GoodsReceiptNote`, `GoodsReceiptLine`  
**Permission:** `purchase` module.

## 2. Business rules

1. Pull from PO (BaseType 31); received qty â‰¤ ordered âˆ’ already received.
2. On post: `StockMovement(GoodsReceipt)`; increment `on_hand`.
3. Update PO line `received_qty`; close PO when fully received.
4. Weighted-average cost updated via `StockService`.

## 3. API

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/inbound/grns` | Implemented |
| POST | `/api/inbound/grns/{id}/post` | Implemented |

## 4. Frontend

- `ReceivingEntryPage` â€” UI shell
- `GrnsPage` â€” API-backed, **not routed**

## 5. Acceptance criteria

- [ ] Create GRN from PO
- [ ] Post increases stock and cost
- [ ] Route `GrnsPage` or wire `ReceivingEntryPage` to API

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Receiving Entry | `/purchase/receiving-entry` | GRN against PO |

---

## 7. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** Browse `stock-receipts` (GRNs)

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Source PO | `purchase-orders` (Posted filter) |
| Supplier | `suppliers` (from PO) |
| Warehouse | `warehouses` |

### Line grid

- [ ] **Pull from PO** â€” select lines with receive qty
- [ ] Received qty â‰¤ ordered âˆ’ already received
- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md)

---

## 8. Permissions

`purchase` module.

---

## 9. Localization keys

Namespace: `purchase.receiving.*`

| Key | id | en |
|-----|-----|-----|
| `purchase.receiving.title` | Penerimaan Barang | Receiving Entry |
| `purchase.receiving.pullFromPo` | Ambil dari PO | Pull from PO |

---

## 10. How This Matches Existing Patterns

Foundation PRDs; `PurchaseTransactionFormPage.tsx`.
