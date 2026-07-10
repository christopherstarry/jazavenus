# Database Table Catalog

**Last updated:** 2026-07-10  
**Source of truth:** `Jaza.Domain` entities + `AppDbContext` + migration `EnhanceAuditLogs`

Canonical names in **bold snake_case**; physical PostgreSQL names in `code` where different.

---

## Conventions (all `Entity` subclasses)

| Column | Type | Notes |
|--------|------|-------|
| `Id` | uuid | Version 7 GUID |
| `CreatedAtUtc` | timestamptz | Set by interceptor |
| `CreatedByUserId` | uuid? | |
| `UpdatedAtUtc` | timestamptz? | |
| `UpdatedByUserId` | uuid? | |
| `IsDeleted` | boolean | Soft delete, default false |
| `DeletedAtUtc` | timestamptz? | |
| `DeletedByUserId` | uuid? | |
| `RowVersion` | uint | Optimistic concurrency (xmin) |

---

## Audit (non-Entity)

### audit_logs → `AuditLogs`

| Column | Type | Notes |
|--------|------|-------|
| `OccurredAtUtc` | timestamptz | |
| `UserId`, `UserName` | uuid?, varchar | Actor |
| `Action` | varchar(64) | Create, Update, Delete, Post, Void, … |
| `Entity` | varchar(64) | C# type name |
| `EntityId` | uuid? | |
| `EntityCode` | varchar(64)? | Document number / code |
| `Module` | varchar(32)? | master, purchase, sales, … |
| `ChangesJson` | text? | Field diff array |
| `BeforeJson`, `AfterJson` | text? | Full snapshots |
| `Notes` | text? | |

Indexes: `OccurredAtUtc`, `(Entity, EntityId)`, `EntityCode`, `(Module, OccurredAtUtc)`, `(UserId, OccurredAtUtc)`.

---

## Master data (PascalCase tables)

| Canonical | Physical | Key columns | Unique indexes |
|-----------|----------|-------------|----------------|
| **products** | `Items` | `Sku`, `Name`, `BrandId`, `CategoryId`, `IsActive` | `Sku` (soft-delete filter) |
| **customers** | `Customers` | `Code`, `Name`, `SalesmanId`, `CreditLimit` | `Code` |
| **customer_addresses** | `CustomerAddresses` | `CustomerId`, `Label`, `Address` | — |
| **suppliers** | `Suppliers` | `Code`, `Name` | `Code` |
| **brands** | `Brands` | `Code`, `Name` | `Code` |
| **warehouses** | `Warehouses` | `Code`, `Name`, `WarehouseTypeId` | `Code` |
| **locations** | `Locations` | `WarehouseId`, `Code` | `(WarehouseId, Code)` |

Full lookup tables (`Banks`, `Salesmen`, `PaymentTerms`, `PriceTiers`, …) follow `Code` + `Name` pattern. See `AppDbContext.ConfigureMasterData`.

---

## Purchase transactions

### purchase_orders → `PurchaseOrders`

| Column | Type | FK |
|--------|------|-----|
| `Number` | varchar | |
| `Division` | varchar(50) | default `''` |
| `Status` | int | DocumentStatus enum |
| `SupplierId` | uuid | Suppliers |
| `WarehouseId` | uuid | Warehouses |
| `OrderDate`, `ExpectedDate` | date | |
| `Currency` | varchar | default IDR |

**Unique:** `(Division, Number)`

### purchase_order_lines → `PurchaseOrderLines`

| Column | Type | Notes |
|--------|------|-------|
| `PurchaseOrderId` | uuid | FK cascade |
| `LineNumber` | int | |
| `ItemId` | uuid | |
| `Quantity`, `UnitPrice` | numeric(18,4) | |
| `DiscountPercent`, `Discount2Percent`, `Discount3Percent` | numeric | P1/P2/P3 |
| `TaxPercent` | numeric | |
| `QuantityReceived` | numeric | |
| `BaseDocumentType`, `BaseDocumentId`, `BaseLineNumber`, `BaseQuantity` | | Chain link |

### goods_receipts → `GoodsReceiptNotes`

Same header pattern as PO; `ReceivedAt`, `PurchaseOrderId?`, `SupplierDeliveryNote`.

### goods_receipt_lines → `GoodsReceiptLines`

Lines link to `PurchaseOrderLineId?`; base document columns; `UnitCost`, `BatchOrSerial`, `ExpiryDate`.

---

## Sales transactions

### sales_orders → `SalesOrders`

Header: `CustomerId`, `WarehouseId`, `OrderDate`, `RequestedDate`, `Division`, `Status`, `Number`.

### sales_order_lines → `SalesOrderLines`

Includes `QuantityCommitted`, P2/P3 discounts, base document link, `QuantityDelivered`.

### deliveries → `DeliveryOrders`

`SalesOrderId?`, `CustomerId`, `DeliveredAt`, `Division`, `Status`, `Number`.

### delivery_lines → `DeliveryOrderLines`

`SalesOrderLineId?`, `LocationId`, `Quantity`, `UnitCost` (set at post).

### invoices → `Invoices`

| Column | Type | Notes |
|--------|------|-------|
| `Status` | int | InvoiceStatus enum |
| `TaxSerial` | varchar(64)? | Faktur serial |
| `PostedAtUtc` | timestamptz? | Set on post |
| `PostedByUserId` | uuid? | |
| `DeliveryOrderId` | uuid? | |
| `IssueDate`, `DueDate` | date | |

### invoice_lines → `InvoiceLines`

`Description`, pricing fields, base document link.

### payments → `Payments`

`InvoiceId`, `ReceivedAt`, `Method`, `Amount`, `Currency`, `Reference`.

---

## Stock

### stock_on_hand → `StockOnHand`

| Column | Type | Notes |
|--------|------|-------|
| `(ItemId, WarehouseId, LocationId)` | | Unique |
| `Quantity` | numeric | On-hand |
| `CommittedQuantity` | numeric | SO commitment |
| `AverageCost` | numeric | WAC |
| `LastMovementAtUtc` | timestamptz | |

### stock_movements → `StockMovements`

`Type`, `ItemId`, `WarehouseId`, `LocationId`, `Quantity`, `UnitCost`, `SourceDocumentType/Id/Number`.

---

## Phase 2a — Settings

### company_settings

`Division` (unique), `CompanyName`, address fields, `NpwpNumber`, `PkpNumber`, `SettingsJson`.

### fiscal_periods

`(Division, Year, Month)` unique; `StartDate`, `EndDate`, `IsClosed`.

### order_codes / return_codes

`Code` unique, `Name`, `IsActive`.

### extra_discounts / extra_discount_lines

Header: `Code`, `Division`, effective dates. Lines: customer/brand/item scope, `Discount2Percent`, `Discount3Percent`.

---

## Phase 2b — Returns & A/R

### sales_returns / sales_return_lines

Mirror sales docs; `ReturnCode`, link to `DeliveryOrderId?`.

### purchase_returns / purchase_return_lines

Mirror purchase docs; link to `GoodsReceiptNoteId?`.

### credit_memos / credit_memo_lines

AR credit documents; optional `TaxSerial`, `SalesReturnId`, `InvoiceId`.

### payment_allocations

`PaymentId` → `InvoiceId`, `Amount`, `AllocatedAt`.

### post_dated_checks / pdc_clearance_history

PDC header + status history (`Outstanding` → `Cleared` / `Bounced`).

### ar_adjustments

Customer balance adjustments; `(Division, Number)` unique.

### ar_period_closings

`(Division, Year, Month)` unique close record.

---

## Phase 2c — Inventory documents

### stock_receipts / stock_receipt_lines

Non-PO stock in (BPB); `ReasonCode`, warehouse, lines with qty/cost.

### stock_issues / stock_issue_lines

Non-SO stock out (BBK).

### stock_transfers / stock_transfer_lines

`FromWarehouseId`, `ToWarehouseId`, line locations.

### stock_take_sessions / stock_take_lines

Opname: `SystemQuantity`, `CountedQuantity`, `StockTakeStatus` on header.

---

## Phase 2d — Tax

### tax_invoice_serials

`(Division, SerialNumber)` unique; `TaxRegistrationId`, `Status`, optional `InvoiceId` / `CreditMemoId` (FK with Restrict/SetNull).

---

## Payments (Receipt model)

### payments → `Payments`

| Column | Type | Notes |
|--------|------|-------|
| Division | varchar(50) | Legacy CompanyIDKu |
| CustomerId | uuid? | FK → Customers (SetNull) |
| InvoiceId | uuid? | Optional 1:1; batch uses allocations |
| ReceivedAt, Method, Amount, Currency, Reference | | Receipt header |

### payment_allocations → `payment_allocations`

| Column | Type | FK |
|--------|------|-----|
| PaymentId | uuid | Payments (Cascade) |
| InvoiceId | uuid | Invoices (Restrict) |
| Amount | numeric | Per-invoice slice |

`Invoice.AmountPaid` sums allocations first, falls back to direct Payments.

---

## Auth tables

`AppUsers`, `AppRoles`, `UserModulePermissions`, `UserReportPermissions`, `UserPreferences`, `RefreshTokens` — see `ConfigureAuth` in `AppDbContext`.

---

## Related

- [implementation-status.md](implementation-status.md)
- [naming-conventions.md](naming-conventions.md)
- [erd.md](erd.md)
