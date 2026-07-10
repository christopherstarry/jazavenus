# PRD: Sales Return

## 1. Summary

Receive goods returned by customers. Legacy `frmReturn` (ObjType 29). Increases stock and may offset A/R via payment or credit memo.

**New route:** `/sales/sales-return`  
**Permission:** `sales` module.

## 2. User stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| SR-01 | Operator | Create return against customer | Returned goods are recorded |
| SR-02 | Operator | Link to original delivery/invoice | Audit trail is preserved |
| SR-03 | System | Increase OnHand on post | Stock reflects returns |
| SR-04 | Operator | Apply return amount to payment | A/R is reduced |

## 3. Data model (planned)

| Entity | Legacy table |
|--------|-------------|
| `SalesReturn` | Return |
| `SalesReturnLine` | ReturnDetail1 |

Header/line structure mirrors `SalesOrder` pattern with `base_type=28` (Delivery) or `30` (Invoice).

## 4. Business rules

1. Return qty ≤ originally delivered/invoiced qty.
2. On post: `StockMovement(GoodsReceipt)` or dedicated return type; increment `on_hand`.
3. Return amount can be applied in Payment Receipt as `RtrnAppld`.
4. Credit memo may be generated for tax purposes (Faktur CN).

## 5. Status

| Layer | Status |
|-------|--------|
| Backend entity | **Missing** |
| API | **Missing** |
| Frontend | UI shell (`SalesReturnPage`) |

## 6. Acceptance criteria

- [ ] Create return with customer and lines
- [ ] Link to source delivery/invoice
- [ ] Post increases stock
- [ ] Return amount available for payment allocation
