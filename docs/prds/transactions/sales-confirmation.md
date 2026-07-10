# PRD: Sales Confirmation (Delivery)

## 1. Summary

Confirm sales orders for picking and shipment. Legacy `frmDelivery` (Sales Confirmation, ObjType 28). Creates delivery document that reduces on-hand stock and releases commitment.

**New route:** `/sales/sales-confirmation`  
**Backend entity:** `DeliveryOrder` + `DeliveryOrderLine`  
**Permission:** `sales` module.

## 2. User stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| SC-01 | Warehouse operator | Pull open SO lines into a delivery | I ship what was ordered |
| SC-02 | System | Reduce OnHand and IsCommited on post | Stock ledger is accurate |
| SC-03 | System | Check credit limit against `DNotesBal` | Delivery-stage credit control |
| SC-04 | Operator | Partial delivery (qty < ordered) | Back orders supported |
| SC-05 | Operator | Print delivery note (Surat Jalan) | Physical shipment document |

## 3. Document chain

```
SalesOrder (27) --BaseType/Entry/Line--> DeliveryOrder (28) --BaseType--> Invoice (30)
```

| Base field | Purpose |
|------------|---------|
| `base_type` | 27 = Order |
| `base_entry` | Source DocNum |
| `base_line` | Source line number |
| `base_qty` | Qty pulled from source |

## 4. Business rules

1. Source SO line must be Open; qty ≤ (ordered − already delivered).
2. On post: `StockMovement(GoodsIssue)`; decrement `on_hand`; decrement `committed`.
3. Credit check uses `DNotesBal` (not `OrdersBal` or `Balance`).
4. Overdue check same as SO.
5. Update SO line `QuantityDelivered`; auto-close SO when all lines fully delivered.

## 5. API (existing)

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/outbound/delivery-orders` | Implemented |
| POST | `/api/outbound/delivery-orders/{id}/post` | Implemented |

**Gaps:** Pull-from-SO UI, credit/overdue, print PDF.

## 6. Frontend

`SalesConfirmationPage` — UI shell, not API-wired.

## 7. Acceptance criteria

- [ ] Select SO and create delivery with linked base lines
- [ ] Post updates stock ledger correctly
- [ ] Partial delivery leaves SO open
- [ ] Credit/overdue gates match legacy
