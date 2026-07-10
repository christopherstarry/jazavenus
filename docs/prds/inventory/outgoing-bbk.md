# PRD: Outgoing Transaction (BBK)

## 1. Summary

Issue stock out of warehouse without sales delivery. Legacy `frmGoodIssue` (ObjType 35).

**Route:** `/inventory/outgoing-transaction-bbk`  
**Permission:** `inventory` module.

## 2. Business rules

1. Non-sales stock issue (damage, sample, promo).
2. On post: `StockMovement(AdjustmentOut)` or dedicated BBK type.
3. Available qty check before post.

## 3. Status

Backend partial; frontend UI shell.

## 4. Acceptance criteria

- [ ] First-class BBK document entity
- [ ] Post decreases on-hand
- [ ] BBK report support
