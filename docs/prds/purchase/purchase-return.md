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
