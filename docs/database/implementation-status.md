# Database Implementation Status

**Last updated:** 2026-07-10  
**EF migration baseline:** `20260710082434_EnhanceAuditLogs`

Living tracker of which tables exist in EF Core vs planned. Physical PostgreSQL table names shown in **bold** where they differ from the C# entity name.

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Entity + migration + `AppDbContext` DbSet |
| ⚠️ Partial | Entity exists; business logic / API not wired |
| 📋 Planned | Documented only; no EF entity yet |
| 🚫 Dropped | Intentionally out of scope |

---

## Phase 1 — Existing modules (gaps closed)

| Canonical table | EF entity | Physical table | Status | Migration |
|-----------------|-----------|----------------|--------|-----------|
| audit_logs (extended) | `AuditLog` | `AuditLogs` | ✅ | `EnhanceAuditLogs` |
| purchase_orders | `PurchaseOrder` | `PurchaseOrders` | ✅ + Division | `EnhanceAuditLogs` |
| purchase_order_lines | `PurchaseOrderLine` | `PurchaseOrderLines` | ✅ + base link, P2/P3 | `EnhanceAuditLogs` |
| goods_receipts | `GoodsReceiptNote` | `GoodsReceiptNotes` | ✅ + Division | `EnhanceAuditLogs` |
| goods_receipt_lines | `GoodsReceiptLine` | `GoodsReceiptLines` | ✅ + base link | `EnhanceAuditLogs` |
| sales_orders | `SalesOrder` | `SalesOrders` | ✅ + Division | `EnhanceAuditLogs` |
| sales_order_lines | `SalesOrderLine` | `SalesOrderLines` | ✅ + committed qty | `EnhanceAuditLogs` |
| deliveries | `DeliveryOrder` | `DeliveryOrders` | ✅ + Division | `EnhanceAuditLogs` |
| delivery_lines | `DeliveryOrderLine` | `DeliveryOrderLines` | ✅ + base link | `EnhanceAuditLogs` |
| invoices | `Invoice` | `Invoices` | ✅ + TaxSerial, Posted* | `EnhanceAuditLogs` |
| invoice_lines | `InvoiceLine` | `InvoiceLines` | ✅ + base link, P2/P3 | `EnhanceAuditLogs` |
| payments | `Payment` | `Payments` | ✅ | prior migrations |
| stock_on_hand | `StockOnHand` | `StockOnHand` | ✅ + CommittedQuantity | `EnhanceAuditLogs` |
| stock_movements | `StockMovement` | `StockMovements` | ✅ | prior migrations |

---

## Phase 2a — Settings & lookups

| Canonical table | EF entity | Physical table | Status |
|-----------------|-----------|----------------|--------|
| company_settings | `CompanySettings` | **company_settings** | ✅ |
| fiscal_periods | `FiscalPeriod` | **fiscal_periods** | ✅ |
| order_codes | `OrderCode` | **order_codes** | ✅ |
| return_codes | `ReturnCode` | **return_codes** | ✅ |
| extra_discounts | `ExtraDiscount` | **extra_discounts** | ✅ |
| extra_discount_lines | `ExtraDiscountLine` | **extra_discount_lines** | ✅ |

---

## Phase 2b — Returns & A/R

| Canonical table | EF entity | Physical table | Status |
|-----------------|-----------|----------------|--------|
| sales_returns | `SalesReturn` | **sales_returns** | ✅ schema only |
| sales_return_lines | `SalesReturnLine` | **sales_return_lines** | ✅ schema only |
| purchase_returns | `PurchaseReturn` | **purchase_returns** | ✅ schema only |
| purchase_return_lines | `PurchaseReturnLine` | **purchase_return_lines** | ✅ schema only |
| credit_memos | `CreditMemo` | **credit_memos** | ✅ schema only |
| credit_memo_lines | `CreditMemoLine` | **credit_memo_lines** | ✅ schema only |
| payment_allocations | `PaymentAllocation` | **payment_allocations** | ✅ schema only |
| post_dated_checks | `PostDatedCheck` | **post_dated_checks** | ✅ schema only |
| pdc_clearance_history | `PdcClearanceHistory` | **pdc_clearance_history** | ✅ schema only |
| ar_adjustments | `ArAdjustment` | **ar_adjustments** | ✅ schema only |
| ar_period_closings | `ArPeriodClosing` | **ar_period_closings** | ✅ schema only |

---

## Phase 2c — Inventory documents

| Canonical table | EF entity | Physical table | Status |
|-----------------|-----------|----------------|--------|
| stock_receipts | `StockReceipt` | **stock_receipts** | ✅ schema only |
| stock_receipt_lines | `StockReceiptLine` | **stock_receipt_lines** | ✅ schema only |
| stock_issues | `StockIssue` | **stock_issues** | ✅ schema only |
| stock_issue_lines | `StockIssueLine` | **stock_issue_lines** | ✅ schema only |
| stock_transfers | `StockTransfer` | **stock_transfers** | ✅ schema only |
| stock_transfer_lines | `StockTransferLine` | **stock_transfer_lines** | ✅ schema only |
| stock_take_sessions | `StockTakeSession` | **stock_take_sessions** | ✅ schema only |
| stock_take_lines | `StockTakeLine` | **stock_take_lines** | ✅ schema only |

---

## Phase 2d — Tax

| Canonical table | EF entity | Physical table | Status |
|-----------------|-----------|----------------|--------|
| tax_invoice_serials | `TaxInvoiceSerial` | **tax_invoice_serials** | ✅ schema only |

---

## Master data (pre-existing)

All master-data entities from `InitialPostgres` through `AddClassOutlets` remain ✅. See [table-catalog.md](table-catalog.md) § Master data.

---

## Not yet implemented

| Legacy module | Canonical table | Status |
|---------------|-----------------|--------|
| Consignment | `consignment` + lines | 📋 if Konsinyasi WH used |
| SistemLog archive | `legacy_audit_archive` | 📋 ETL subset TBD |

---

## Next steps

1. Apply `EnhanceAuditLogs` to staging Neon: `dotnet ef database update`
2. Wire Phase 2 entities to application services and API controllers
3. Complete ETL mappings in [schema-mapping.md](../schema-mapping.md)
4. Optional Phase 3: rename legacy PascalCase tables to snake_case (deferred)

---

## Related

- [table-catalog.md](table-catalog.md)
- [migrations-changelog.md](migrations-changelog.md)
- [naming-conventions.md](naming-conventions.md)
