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
4. **Available qty:** `on_hand - committed` must be â‰¥ line qty (per warehouse type rules).
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
| Route in `modules.tsx` | Yes â€” `SalesOrderPage` |
| API wired | **No** â€” local state only |
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

---

## 9. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Sales Order entry | `/sales/sales-order` | Create, edit, post sales orders |

Build on [SalesTransactionFormPage.tsx](../../../frontend/src/features/sales/SalesTransactionFormPage.tsx).

---

## 10. UI Behavior

### Toolbar ([transaction-toolbar-and-shortcuts.md](../../shared/ui-foundation/transaction-toolbar-and-shortcuts.md))

- [ ] Mode: `transaction`
- [ ] **F1** New â€” clear form for new SO
- [ ] **F2** Save â€” create/update draft; confirm on update ([dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md))
- [ ] **F3** Delete â€” void draft or confirm cancel posted doc
- [ ] **F4** Browse â€” open `sales-orders` lookup to load existing document
- [ ] **F5** Print â€” disabled until posted
- [ ] **Esc** Close â€” navigate to sales hub

### Header fields (lookup via [lookup-browse-dialog.md](../../shared/ui-foundation/lookup-browse-dialog.md))

| Field | Lookup type | Notes |
|-------|-------------|-------|
| Doc # | `sales-orders` | F4 browse; read-only after save |
| Customer | `customers` | Magnifier; fills name, credit info |
| Salesman | `salesmen` | Magnifier |
| Payment term | `payment-terms` | Magnifier |
| Warehouse | `warehouses` | Division-scoped |
| Ship-to | `customer-addresses` | Parent: customer |
| Price tier | `price-tiers` | HJP/HPD/HET |

- [ ] Division banner via [LegacyDivisionFormNav.tsx](../../../frontend/src/features/common/LegacyDivisionFormNav.tsx)
- [ ] Doc date locked after post; F6 admin unlock for date override

### Line grid ([editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md))

- [ ] Columns: Line#, Item, Item Name, Qty, UOM, Unit Price, Disc1%, Disc2%, Disc3%, Tax%, Line Total
- [ ] Item magnifier â†’ `items` lookup + `GET /api/pricing/resolve`
- [ ] P3 free-goods row when ExtraDiscount applies
- [ ] Totals footer: SubTotal, P1/P2/P3, Tax, Grand Total

### Dialogs

- [ ] Credit limit fail â†’ Yes/No/Cancel (`dialog.creditLimit`)
- [ ] Overdue fail â†’ Yes/No/Cancel (`dialog.overdue`)
- [ ] Post success â†’ "Buat dokumen baru?" (`dialog.newDocument`)

### States

- [ ] Loading skeleton on document load
- [ ] Posted: read-only grid, Print enabled
- [ ] `canEdit === false`: toolbar edit buttons hidden

---

## 11. Permissions

| Role | Create/Edit | Post | Void |
|------|-------------|------|------|
| SuperAdmin / Admin | Yes | Yes | Yes |
| Sales (edit) | Yes | No | No |
| Sales (view) | No | No | No |

---

## 12. Localization keys

Namespace: `sales.salesOrder.*`

| Key | id | en |
|-----|-----|-----|
| `sales.salesOrder.title` | Sales Order | Sales Order |
| `sales.salesOrder.docNum` | No. Order | Order No. |
| `sales.salesOrder.customer` | Pelanggan | Customer |
| `sales.salesOrder.salesman` | Salesman | Salesman |
| `sales.salesOrder.warehouse` | Gudang | Warehouse |
| `sales.salesOrder.priceTier` | Tingkat Harga | Price Tier |
| `sales.salesOrder.grid.item` | Kode Barang | Item Code |
| `sales.salesOrder.grid.qty` | Kuantitas | Quantity |

See [i18n-framework.md](../../shared/localization/i18n-framework.md).

---

## 13. How This Matches Existing Patterns

- Toolbar: [transaction-toolbar-and-shortcuts.md](../../shared/ui-foundation/transaction-toolbar-and-shortcuts.md)
- Lookup: [lookup-browse-dialog.md](../../shared/ui-foundation/lookup-browse-dialog.md)
- Grid: [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md)
- Dialogs: [dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md)
- Shell unchanged: [AppLayout.tsx](../../../frontend/src/app/AppLayout.tsx), route in [modules.tsx](../../../frontend/src/app/modules.tsx)
