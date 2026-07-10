# PRD: Sales Order

## 1. Summary

Create and manage sales orders (legacy `frmOrderEntry`, ObjType 27). Orders reserve stock (`IsCommited`) and feed Sales Confirmation (Delivery).

**Legacy reference:** `Jaza Venus Legacy Program/docs/06-flow-sales-ar.md`, `frmOrderEntry.frm`, `RuleModule.bas` (`CheckCreditLimit`, `CheckOverDue`).

**New route:** `/sales/sales-order`  
**Permission:** `sales` module, edit access.

## 2. User stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| SO-01 | Sales operator | Create a sales order for a customer | I can record customer demand |
| SO-02 | Sales operator | Add line items with P1/P2/P3 discounts | Pricing matches legacy rules |
| SO-03 | System | Check credit limit against `OrdersBal` | Over-plafond customers are blocked |
| SO-04 | System | Check overdue invoices | Past-due customers are blocked unless admin overrides |
| SO-05 | System | Reserve stock on post (`IsCommited += qty`) | Available qty reflects commitments |
| SO-06 | Sales operator | Reference base documents | Downstream delivery links correctly |

## 3. Data model

Header maps to `SalesOrder` entity. Lines to `SalesOrderLine`.

| Field | Legacy | New | Notes |
|-------|--------|-----|-------|
| DocNum | Order.DocNum | `doc_num` | From `DocumentSeries` |
| DocDate | Order.DocDate | `doc_date` | Session date |
| Customer | CustmrCode | `customer_id` | FK |
| Warehouse | WhsCode | `warehouse_id` | Default ship-from |
| Price tier | PriceCode | `price_tier` | HJP/HPD/HET |
| Discount1/2/3 | P1/P2/P3 | line fields | See discount PRD |
| DocStatus | O/B/C | `DocumentStatus` | Open/Cancelled/Closed |
| Division | Division | `division` | Company filter |

## 4. Business rules (must match legacy)

1. **Credit limit:** `CredLimit > OrdersBal + NewTotal` or block with admin override.
2. **Overdue:** Sum open invoices past `PaymentTerm.due_days`; block if > 0 unless admin override.
3. **Stock commitment:** On post, increment `StockOnHand.committed` (legacy `IsCommited`).
4. **Available qty:** `on_hand - committed` must be ≥ line qty (per warehouse type rules).
5. **P3 free goods:** `(Qty / GiftLimit) * TotalGift` from ExtraDiscount when implemented.
6. **Document numbering:** Gap-free sequence per division via `DocumentSeries`.

## 5. API (existing)

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/outbound/sales-orders` | Implemented |
| POST | `/api/outbound/sales-orders` | Implemented |
| GET | `/api/outbound/sales-orders/{id}` | Implemented |
| POST | `/api/outbound/sales-orders/{id}/post` | Implemented (Admin) |

**Gaps:** PUT/update, cancel/void, credit/overdue validation, stock commitment on post.

## 6. Frontend

| Item | Status |
|------|--------|
| Route in `modules.tsx` | Yes — `SalesOrderPage` |
| API wired | **No** — local state only |
| Legacy toolbar (New/Save/Delete/Print) | UI shell |

## 7. Acceptance criteria

- [ ] Create SO with customer, lines, discounts matching legacy totals
- [ ] Credit limit blocks over-plafond unless SuperAdmin override
- [ ] Overdue check blocks unless admin override
- [ ] Post reserves stock; available qty decreases
- [ ] Cancel releases commitment
- [ ] UI wired to API; no local-only state

## 8. Dependencies

- Master: Customer, Item, PriceTier, PaymentTerm, Warehouse
- Missing: ExtraDiscount (P2/P3), credit/overdue services
