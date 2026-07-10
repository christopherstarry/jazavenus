# PRD: Purchase Order

## 1. Summary

Order goods from suppliers. Legacy `frmPurchaseOrder` (ObjType 31).

**Route:** `/purchase/purchase-order`  
**Backend:** `PurchaseOrder`, `PurchaseOrderLine`  
**Permission:** `purchase` module.

## 2. Business rules

1. Header: supplier, warehouse, payment term, P1/P2/P3 discounts on lines.
2. On post: status â†’ Posted; no stock impact until GRN.
3. Document number from `DocumentSeries` (PO prefix).
4. Base document linking for returns: `base_type=31`.

## 3. API

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/inbound/purchase-orders` | Implemented |
| POST | `/api/inbound/purchase-orders/{id}/post` | Implemented |

## 4. Frontend

`PurchaseOrderPage` â€” UI shell, not API-wired.

## 5. Acceptance criteria

- [ ] Create PO with supplier and lines
- [ ] Post locks document for receiving
- [ ] UI wired to API

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Purchase Order | `/purchase/purchase-order` | Create PO for supplier |

---

## 7. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** Browse `purchase-orders`; standard F1â€“F3, Esc

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Supplier | `suppliers` |
| Warehouse | `warehouses` |
| Payment term | `payment-terms` |

### Line grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md): Item, Qty, UOM, Price, Disc1â€“3%, Total
- [ ] Item magnifier â†’ `items` lookup

---

## 8. Permissions

`purchase` module â€” edit vs view per role.

---

## 9. Localization keys

Namespace: `purchase.purchaseOrder.*`

| Key | id | en |
|-----|-----|-----|
| `purchase.purchaseOrder.title` | Purchase Order | Purchase Order |
| `purchase.purchaseOrder.supplier` | Supplier | Supplier |

---

## 10. How This Matches Existing Patterns

Foundation PRDs; `PurchaseTransactionFormPage.tsx`.
