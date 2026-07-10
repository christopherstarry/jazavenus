# PRD: Receiving Entry (GRN / BPB)

## 1. Summary

Record stock received from suppliers against PO. Legacy `frmPurchaseReceive` (ObjType 32). Posts stock IN.

**Route:** `/purchase/receiving-entry`  
**Backend:** `GoodsReceiptNote`, `GoodsReceiptLine`  
**Permission:** `purchase` module.

## 2. Business rules

1. Pull from PO (BaseType 31); received qty ≤ ordered − already received.
2. On post: `StockMovement(GoodsReceipt)`; increment `on_hand`.
3. Update PO line `received_qty`; close PO when fully received.
4. Weighted-average cost updated via `StockService`.

## 3. API

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/inbound/grns` | Implemented |
| POST | `/api/inbound/grns/{id}/post` | Implemented |

## 4. Frontend

- `ReceivingEntryPage` — UI shell
- `GrnsPage` — API-backed, **not routed**

## 5. Acceptance criteria

- [ ] Create GRN from PO
- [ ] Post increases stock and cost
- [ ] Route `GrnsPage` or wire `ReceivingEntryPage` to API
