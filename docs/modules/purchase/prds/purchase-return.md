# PRD: Purchase Return

## 1. Summary

Return goods to supplier. Legacy `frmPurchaseReturn` (ObjType 33). Decreases stock.

**Route:** `/purchase/purchase-return`  
**Permission:** `purchase` module.

## 2. Data model (planned)

| Entity | Legacy |
|--------|--------|
| `PurchaseReturn` | PurchaseReturn |
| `PurchaseReturnLine` | PurchaseReturnDetail1 |

## 3. Business rules

1. Link to PO or GRN via base document fields.
2. On post: `StockMovement(GoodsIssue)`; decrement `on_hand`.

## 4. Status

Backend **Missing**; frontend UI shell only.

## 5. Acceptance criteria

- [ ] Create return against supplier/PO
- [ ] Post decreases stock

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Purchase Return | `/purchase/purchase-return` | Return goods to supplier |

---

## 7. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** Browse `purchase-returns`

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Supplier | `suppliers` |
| Source PO/GRN | `purchase-orders` / `stock-receipts` |

### Line grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md)
- [ ] Stock availability check before post

---

## 8. Permissions

`purchase` module.

---

## 9. Localization keys

Namespace: `purchase.purchaseReturn.*`

| Key | id | en |
|-----|-----|-----|
| `purchase.purchaseReturn.title` | Retur Pembelian | Purchase Return |

---

## 10. How This Matches Existing Patterns

Foundation PRDs; `PurchaseTransactionFormPage.tsx`.
