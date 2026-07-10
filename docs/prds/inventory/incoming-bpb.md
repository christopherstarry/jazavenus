# PRD: Incoming Transaction (BPB)

## 1. Summary

Receive stock into warehouse without PO (adjustment IN). Legacy `frmGoodReceipt` (ObjType 36).

**Route:** `/inventory/incoming-transaction-bpb`  
**Permission:** `inventory` module.

## 2. Business rules

1. Non-PO stock receipt (found stock, correction IN).
2. On post: `StockMovement(AdjustmentIn)` or dedicated BPB type.
3. Requires warehouse, product, qty, reason.

## 3. Status

| Layer | Status |
|-------|--------|
| Backend | Partial — `StockController` adjustments only |
| Frontend | UI shell |

## 4. Acceptance criteria

- [ ] First-class BPB document entity (not generic adjustment)
- [ ] Post increases on-hand
- [ ] Appears in BPB report
