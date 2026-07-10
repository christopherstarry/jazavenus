# PRD: Purchase Order

## 1. Summary

Order goods from suppliers. Legacy `frmPurchaseOrder` (ObjType 31).

**Route:** `/purchase/purchase-order`  
**Backend:** `PurchaseOrder`, `PurchaseOrderLine`  
**Permission:** `purchase` module.

## 2. Business rules

1. Header: supplier, warehouse, payment term, P1/P2/P3 discounts on lines.
2. On post: status → Posted; no stock impact until GRN.
3. Document number from `DocumentSeries` (PO prefix).
4. Base document linking for returns: `base_type=31`.

## 3. API

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/inbound/purchase-orders` | Implemented |
| POST | `/api/inbound/purchase-orders/{id}/post` | Implemented |

## 4. Frontend

`PurchaseOrderPage` — UI shell, not API-wired.

## 5. Acceptance criteria

- [ ] Create PO with supplier and lines
- [ ] Post locks document for receiving
- [ ] UI wired to API
