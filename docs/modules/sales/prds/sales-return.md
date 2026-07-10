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

1. Return qty â‰¤ originally delivered/invoiced qty.
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

---

## 7. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Sales Return | `/sales/sales-return` | Record customer returns |

---

## 8. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** Browse `sales-returns` (when API exists)

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` |
| Return reason | `return-codes` |
| Source DO/Invoice | `delivery-orders` or `invoices` |

### Line grid

- [ ] Standard [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md)
- [ ] Link icon per line to pick source delivery/invoice line

### Dialogs

- [ ] Post confirm; success â†’ new document prompt

---

## 9. Permissions

`sales` module â€” same as Sales Order.

---

## 10. Localization keys

Namespace: `sales.salesReturn.*`

| Key | id | en |
|-----|-----|-----|
| `sales.salesReturn.title` | Retur Penjualan | Sales Return |
| `sales.salesReturn.reason` | Alasan Retur | Return Reason |

---

## 11. How This Matches Existing Patterns

Foundation PRDs; `SalesReturnPage` shell.
