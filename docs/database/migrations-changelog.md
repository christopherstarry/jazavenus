# EF Migrations Changelog

Human-readable log of Entity Framework migrations for Jaza Venus PostgreSQL.

---

## 2026-05-06 — `InitialPostgres`

- Identity tables (`AppUsers`, `AppRoles`, …)
- Master data core (`Items`, `Customers`, `Suppliers`, `Warehouses`, …)
- Transaction skeleton: `PurchaseOrders`, `SalesOrders`, `DeliveryOrders`, `Invoices`, `Payments`
- Stock: `StockMovements`, `StockOnHand`
- `AuditLogs`, `ErrorLogs`, `DocumentSeries`

---

## 2026-05-08 — `AddMasterDataLookups`

- Lookup tables: `WarehouseTypes`, `PaymentTerms`, `OutletTypes`, trade/distribution types, price tiers, discount codes, etc.

---

## 2026-05-12 — `AddCustomerAddressesAndBrandDiscounts`

- `CustomerAddresses`, `BrandDiscounts`

---

## 2026-05-20 — `AddItemPricesAndDiscounts`

- `ItemPrices`, `ItemDiscounts`

---

## 2026-05-26 — `AddClassOutlets`

- `ClassOutlets`

---

## 2026-07-10 — `EnhanceAuditLogs`

Single migration covering Phase 1 (audit + transaction parity) and Phase 2 (parity tables). Logical sections:

### Phase 1B — Audit enhancement

- `AuditLogs`: add `EntityCode`, `Module`, `ChangesJson`
- Indexes: `EntityCode`, `(Module, OccurredAtUtc)`, `(UserId, OccurredAtUtc)`

### Phase 1A — Transaction parity columns

**Headers** — add `Division` (varchar 50, default `''`); replace unique `Number` with unique `(Division, Number)` on:
- `PurchaseOrders`, `GoodsReceiptNotes`, `SalesOrders`, `DeliveryOrders`, `Invoices`

**Lines** — add `BaseDocumentType`, `BaseDocumentId`, `BaseLineNumber`, `BaseQuantity`, `Discount2Percent`, `Discount3Percent` where applicable.

**SalesOrderLines** — add `QuantityCommitted`.

**StockOnHand** — add `CommittedQuantity`.

**Invoices** — add `TaxSerial`, `PostedAtUtc`, `PostedByUserId`.

### Phase 2a — Settings & lookups

- `company_settings`, `fiscal_periods`, `order_codes`, `return_codes`
- `extra_discounts`, `extra_discount_lines`

### Phase 2b — Returns & A/R

- `sales_returns`, `sales_return_lines`
- `purchase_returns`, `purchase_return_lines`
- `credit_memos`, `credit_memo_lines`
- `payment_allocations`
- `post_dated_checks`, `pdc_clearance_history`
- `ar_adjustments`, `ar_period_closings`

### Phase 2c — Inventory documents

- `stock_receipts`, `stock_receipt_lines`
- `stock_issues`, `stock_issue_lines`
- `stock_transfers`, `stock_transfer_lines`
- `stock_take_sessions`, `stock_take_lines`

### Phase 2d — Tax

- `tax_invoice_serials`

---

## 2026-07-10 — `FixForeignKeyBehaviors`

### Payment / Receipt alignment

- `Payments.InvoiceId` nullable; add `CustomerId`, `Division`
- `payment_allocations` as primary invoice link for batch receipts
- `Invoice.PaymentAllocations` navigation; `AmountPaid` prefers allocation sum

### Missing Phase 2 FKs

- `sales_returns.InvoiceId`, `credit_memos` links, `purchase_returns.GoodsReceiptNoteId`, `tax_invoice_serials.CreditMemoId`

### Delete behavior hardening

- Master → transaction: **Restrict**; lines → Item: **Restrict**; allocations → Invoice: **Restrict**

---

## Apply to database

```bash
cd backend
dotnet ef database update --project src/Jaza.Infrastructure --startup-project src/Jaza.Api
```

---

## Related

- [implementation-status.md](implementation-status.md)
- [table-catalog.md](table-catalog.md)
