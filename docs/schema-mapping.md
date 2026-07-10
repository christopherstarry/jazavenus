# Legacy → New Schema Mapping

Column-level ETL mappings for cutover. See also [legacy-schema.txt](legacy-schema.txt), [migration-howto.md](migration-howto.md).

**Conventions:** [database/naming-conventions.md](database/naming-conventions.md) | **Target tables:** [database/table-catalog.md](database/table-catalog.md)

---

## Conventions for the new schema

- All ids are `uuid` (EF Version 7 GUIDs); `Entity.LegacyId` stores legacy `DocEntry` (int).
- Money / quantity: `numeric(18,4)`; timestamps: `timestamptz` UTC.
- Soft-delete + audit columns on every `Entity` table.
- Transaction headers: `Division` (varchar 50); unique `(Division, Number)` with soft-delete filter.
- **Batch receipts:** `Receipt` → `Payments` header; `ReceiptDetail1` → `payment_allocations` (not `Payment.InvoiceId` alone).

---

## Load order (mandatory FK sequence)

Run `Jaza.Migration` with `--only=` in this order. Pass `--division=DISTRIBUTIONBDG` (etc.) per source DB, or merge 4 DBs sequentially.

| Tier | `--only=` entities | Depends on |
|------|-------------------|------------|
| 0 | Units, Brands, Banks, PaymentTerms, TaxRegistrations, Areas, Salesmen, Collectors, lookup codes | — |
| 1 | Categories, SubCategories, Warehouses, Suppliers, Customers, Items, ItemPrices, ItemDiscounts | Tier 0 |
| 2 | company_settings, fiscal_periods | Tier 0 |
| 3 | PurchaseOrders (+ lines), GoodsReceiptNotes (+ lines) | Tier 1 |
| 4 | SalesOrders (+ lines), DeliveryOrders (+ lines), Invoices (+ lines) | Tier 1 |
| 5 | Payments, PaymentAllocations | Tier 4 Invoices |
| 6 | SalesReturns, CreditMemos, PurchaseReturns, PDC, tax_invoice_serials | Tier 4–5 |
| 7 | StockOnHand, StockMovements, stock_receipts/issues/transfers | Tier 1 |
| 8 | AppUsers (for PostedByUserId / audit) | — |

`LegacyIdMap` + `LegacyIdMapHydrator` resolve FKs; unresolved rows go to `etl-errors/*.errors.txt`.

---

## Division mapping

| Legacy source | `Division` column value |
|---------------|-------------------------|
| Database `DISTRIBUTIONBDG` or `CompanyIDKu='BDG'` | `DISTRIBUTIONBDG` |
| Database `DISTRIBUTIONCRB` or `CompanyIDKu='CRB'` | `DISTRIBUTIONCRB` |
| Database `TRADINGBDG` | `TRADINGBDG` |
| Database `TRADINGCRB` | `TRADINGCRB` |

**4-DB merge:** Run ETL once per restored backup with matching `--division=`. `DocEntry` collisions across divisions are safe because map keys include division.

**Single-DB cutover:** Omit `--division=` if `CompanyIDKu` is populated on every transaction row.

---

## DocStatus truth table

| Legacy `DocStatus` | VB6 meaning | `DocumentStatus` | `InvoiceStatus` |
|--------------------|-------------|------------------|-----------------|
| O | Open | Draft | Draft |
| C | Closed | Posted | Posted |
| B | Cancelled | Voided | Voided |
| P | Posted (alt) | Posted | Posted |
| V | Voided (alt) | Voided | Voided |

---

## Master data mappings

### `dbo.Uom` → `Units`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| UOM | Code | direct |
| DSCRIPTION | Name | direct |

### `dbo.Category` → `Categories`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| CatgryCode | Code | IdMap master |
| Dscription | Name | direct |

### `dbo.Brand` → `Brands`

| Legacy | New |
|--------|-----|
| BrandCode | Code |
| Dscription | Name |

### `dbo.Supplier` → `Suppliers`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| SuppCode | Code | IdMap |
| SuppName | Name | |
| NPWPNumber | TaxId | |
| TermCode | PaymentTermsDays | lookup PaymentTerm.DueDay |

### `dbo.Customer` → `Customers`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| CustmrCode | Code | IdMap |
| CustmrName | Name | |
| CredLimit | CreditLimit | |
| SlPrsnCode, ClctrCode, etc. | *Code string fields | stored as codes (not UUID FK) |

### `dbo.Warehouse` → `Warehouses`

| Legacy | New |
|--------|-----|
| WhsCode | Code |
| Dscription | Name |

### `dbo.Item` → `Items`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| ItemCode | Sku | IdMap |
| Dscription | Name | |
| CatgryCode | CategoryId | IdMap("Category", code) — default DEF if missing |
| UOM | UnitId | IdMap("Unit", code) |
| CodeBars | Barcode | |
| BrandCode | — | **not on Item entity**; use extra_discount_lines for brand scope |

### `dbo.SubCategory` → `SubCategories`

| Legacy | New | Notes |
|--------|-----|-------|
| SubCatCode | Code | **CategoryId required** — assign default category or infer |

---

## Transaction mappings

### `dbo.PurchaseOrder` → `PurchaseOrders`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| DocEntry | LegacyId + IdMap doc | |
| DocNum | Number | `PO-{DocNum}` |
| CompanyIDKu | Division | division map |
| DocStatus | Status | DocStatus table |
| SuppCode | SupplierId | IdMap("Supplier") |
| WhsCode | WarehouseId | IdMap("Warehouse") |
| DocDate | OrderDate | UTC |

### `dbo.[Order]` → `SalesOrders`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| DocEntry | LegacyId | |
| CustmrCode | CustomerId | IdMap("Customer") |
| WhsCode | WarehouseId | IdMap("Warehouse") |

### `dbo.Delivery` → `DeliveryOrders`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| BaseEntry | SalesOrderId | IdMap("SalesOrder", division, BaseEntry) |
| CustmrCode | CustomerId | IdMap |

### `dbo.Invoice` → `Invoices`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| DocEntry | LegacyId | |
| CustmrCode | CustomerId | IdMap |
| BaseEntry | DeliveryOrderId | IdMap("DeliveryOrder") optional |

### `dbo.Receipt` + `ReceiptDetail1` → `Payments` + `payment_allocations`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| Receipt.DocEntry | Payment.LegacyId | IdMap("Payment") |
| Receipt.CustmrCode | Payment.CustomerId | IdMap |
| Receipt.CompanyIDKu | Payment.Division | |
| ReceiptDetail1.DocEntry | PaymentAllocation.PaymentId | IdMap("Payment") |
| ReceiptDetail1.BaseEntry | PaymentAllocation.InvoiceId | IdMap("Invoice") |
| ReceiptDetail1.SumApplied | PaymentAllocation.Amount | |

### `dbo.Return` → `sales_returns`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| DocEntry | LegacyId | |
| ReturnCode | ReturnCode | string (lookup table optional) |
| BaseEntry | Lines.BaseDocumentId | IdMap parent doc |

### `dbo.Giro` → `post_dated_checks`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| GiroNo | Number | |
| CustmrCode | CustomerId | IdMap |
| BankCode | BankId | IdMap("Bank") |

### `dbo.SeriFaktur` → `tax_invoice_serials`

| Legacy | New | FK resolution |
|--------|-----|---------------|
| SeriNo | SerialNumber | |
| TaxNo | TaxRegistrationId | IdMap by RegistrationNo |
| InvoiceNo | InvoiceId | IdMap("Invoice") |

---

## Known entity mismatches

| Issue | ETL handling |
|-------|--------------|
| Item has no BrandId | Skip brand on item; map brand in extra_discount_lines only |
| SubCategory has no CategoryId in legacy | Default Category `DEF` |
| DeliveryOrderLine.LocationId | Map Inventory.Location text → Locations or leave null |
| Customer uses code strings for salesman etc. | Copy codes to Customer.*Code fields |

---

## ETL tooling

```bash
cd backend
dotnet run --project src/Jaza.Migration -- \
  --dry-run \
  --division=DISTRIBUTIONBDG \
  --legacy-cs="Server=...;Database=sales;..." \
  --target-cs="Host=...;Database=..." \
  --only=Units,Categories,Brands,Suppliers,Customers,Warehouses,Items
```

Incremental: `--since=2025-01-01` filters on `AuditDate` where supported.

---

## ETL status

| Area | Status |
|------|--------|
| LegacyIdMap + hydrator | Implemented |
| Master migrators (Units–Items) | Implemented |
| Transaction headers (PO, SO, Invoice) | Implemented |
| Payments + allocations | Implemented |
| Line-level detail tables | Pending (OrderDetail1, etc.) |
| Stock / returns / PDC | Pending |
| Full wet-run reconciliation | Pending staging Neon |
