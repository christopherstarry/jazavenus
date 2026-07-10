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

1. Source SO line must be Open; qty â‰¤ (ordered âˆ’ already delivered).
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

`SalesConfirmationPage` â€” UI shell, not API-wired.

## 7. Acceptance criteria

- [ ] Select SO and create delivery with linked base lines
- [ ] Post updates stock ledger correctly
- [ ] Partial delivery leaves SO open
- [ ] Credit/overdue gates match legacy

---

## 8. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Sales Confirmation | `/sales/sales-confirmation` | Create delivery from SO |

---

## 9. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F1** New, **F2** Save, **F3** Delete, **F4** Browse `delivery-orders`, **F5** Print Surat Jalan, **Esc** Close

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Source SO | `sales-orders` (Open status filter) |
| Customer | `customers` (auto from SO) |
| Warehouse | `warehouses` |
| Salesman | `salesmen` |

### Line grid

- [ ] **Pull from SO** button opens SO line picker (multi-select qty per line)
- [ ] Columns: Item, Ordered Qty, Delivered Qty, This Delivery, UOM, Price, Total
- [ ] Partial qty allowed; base_line/base_qty hidden fields preserved
- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md) for manual line edits

### Dialogs

- [ ] Credit (`DNotesBal`) and overdue prompts per [dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md)

---

## 10. Permissions

Same as Sales Order (`sales` module).

---

## 11. Localization keys

Namespace: `sales.salesConfirmation.*`

| Key | id | en |
|-----|-----|-----|
| `sales.salesConfirmation.title` | Konfirmasi Penjualan | Sales Confirmation |
| `sales.salesConfirmation.pullFromSo` | Ambil dari Order | Pull from Order |
| `sales.salesConfirmation.suratJalan` | Surat Jalan | Delivery Note |

---

## 12. How This Matches Existing Patterns

Foundation PRDs in `docs/modules/shared/ui-foundation/`; page shell: `SalesTransactionFormPage.tsx`.
