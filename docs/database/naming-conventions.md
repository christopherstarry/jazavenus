# Database Naming Conventions

**Date:** 2026-07-10

How legacy VB6/SQL Server names map to canonical PostgreSQL documentation names and current EF Core physical tables.

---

## Rules

1. **Documentation** uses `snake_case` plural table names (`sales_orders`, `products`).
2. **Phase 1 existing tables** keep PascalCase physical names (`SalesOrders`, `Items`) to avoid breaking the running API.
3. **Phase 2+ new tables** use canonical `snake_case` via `.ToTable("sales_returns")` in `AppDbContext`.
4. **C# entities** remain PascalCase singular (`SalesOrder`, `Item`).
5. **Business codes** stored language-neutral (`Draft`, `Posted`, `Voided`); UI labels come from i18n (`id.json` / `en.json`).
6. **No `NameEn` / `NameId` columns** on master tables — localization is a frontend concern.

---

## Master data

| Legacy (VB/SQL) | Canonical (docs) | EF entity | Physical table |
|-----------------|------------------|-----------|----------------|
| `Item` | `products` | `Item` | `Items` |
| `CustmrCode` | `customers.code` | `Customer.Code` | `Customers` |
| `Supplier` | `suppliers` | `Supplier` | `Suppliers` |
| `Brand` | `brands` | `Brand` | `Brands` |
| `Category` | `item_categories` | `ItemCategory` | `Categories` |
| `SubCategory` | `sub_categories` | `SubCategory` | `SubCategories` |
| `Warehouse` | `warehouses` | `Warehouse` | `Warehouses` |
| `Salesman` | `salesmen` | `Salesman` | `Salesmen` |
| `Collector` | `collector` | `Collector` | `Collectors` |
| `Area` | `areas` | `Area` | `Areas` |
| `Bank` | `banks` | `Bank` | `Banks` |
| `TaxNo` / `SeriFaktur` master | `tax_registrations` | `TaxRegistration` | `TaxRegistrations` |

---

## Transactions (Phase 1)

| Legacy | Canonical | EF entity | Physical table |
|--------|-----------|-----------|----------------|
| `PurchaseOrder` | `purchase_orders` | `PurchaseOrder` | `PurchaseOrders` |
| `PurchaseOrderDetail` | `purchase_order_lines` | `PurchaseOrderLine` | `PurchaseOrderLines` |
| `GoodsReceipt` / BPB | `goods_receipts` | `GoodsReceiptNote` | `GoodsReceiptNotes` |
| `Order` | `sales_orders` | `SalesOrder` | `SalesOrders` |
| `Delivery` | `deliveries` | `DeliveryOrder` | `DeliveryOrders` |
| `Invoice` | `invoices` | `Invoice` | `Invoices` |
| `Receipt` | `payments` | `Payment` | `Payments` |

**Document number uniqueness:** composite `(division, number)` on all transaction headers (legacy per-company doc sequences).

**Line base linking:** `BaseDocumentType`, `BaseDocumentId`, `BaseLineNumber`, `BaseQuantity` on line entities (legacy `BaseEntry` / `BaseLine`).

---

## Phase 2 parity tables (snake_case physical)

| Legacy | Canonical | EF entity | Physical table |
|--------|-----------|-----------|----------------|
| `Preferences` | `company_settings` | `CompanySettings` | `company_settings` |
| `Periode` | `fiscal_periods` | `FiscalPeriod` | `fiscal_periods` |
| `OrderCode` | `order_codes` | `OrderCode` | `order_codes` |
| `ReturnCode` | `return_codes` | `ReturnCode` | `return_codes` |
| `ExtraDiscount` | `extra_discounts` | `ExtraDiscount` | `extra_discounts` |
| `Return` | `sales_returns` | `SalesReturn` | `sales_returns` |
| `PurchaseReturn` | `purchase_returns` | `PurchaseReturn` | `purchase_returns` |
| `CreditMemo` | `credit_memos` | `CreditMemo` | `credit_memos` |
| `ReceiptDetail1` | `payment_allocations` | `PaymentAllocation` | `payment_allocations` |
| `Giro` | `post_dated_checks` | `PostDatedCheck` | `post_dated_checks` |
| `GiroHistory` | `pdc_clearance_history` | `PdcClearanceHistory` | `pdc_clearance_history` |
| `AdjusmentAR` | `ar_adjustments` | `ArAdjustment` | `ar_adjustments` |
| `ClosingAR` | `ar_period_closings` | `ArPeriodClosing` | `ar_period_closings` |
| `GoodsReceipt` (stock) | `stock_receipts` | `StockReceipt` | `stock_receipts` |
| `GoodsIssue` / BBK | `stock_issues` | `StockIssue` | `stock_issues` |
| `Transfer` | `stock_transfers` | `StockTransfer` | `stock_transfers` |
| Stock opname | `stock_take_sessions` | `StockTakeSession` | `stock_take_sessions` |
| `SeriFaktur` serial pool | `tax_invoice_serials` | `TaxInvoiceSerial` | `tax_invoice_serials` |

---

## Audit & status codes (language-neutral)

| Domain | Stored values | UI translation |
|--------|---------------|----------------|
| Document lifecycle | `Draft`, `Posted`, `Voided` | i18n `documentStatus.*` |
| Invoice lifecycle | `Draft`, `Posted`, `PartiallyPaid`, `Paid`, `Voided` | i18n `invoiceStatus.*` |
| Audit actions | `Create`, `Update`, `Delete`, `Post`, `Void`, `Login.Success`, … | i18n `audit.action.*` |
| PDC status | `Outstanding`, `Cleared`, `Bounced`, `Cancelled` | i18n `pdcStatus.*` |

User language preference: `UserPreferences.Language` (`"id"` default | `"en"`).

---

## Optional future rename (Phase 2b UAT)

Single migration batch to rename `PurchaseOrders` → `purchase_orders`, etc. **Deferred** until full parity UAT — higher risk while API is live.

---

## Related

- [database-base-docs.md](database-base-docs.md)
- [implementation-status.md](implementation-status.md)
- [audit-and-history.md](audit-and-history.md)
