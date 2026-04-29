# Legacy → New Schema Mapping

Filled in during Phase 6 once the legacy schema dump exists. Template below.

## Conventions for the new schema

- All ids are `Guid` (server-generated, sequential via `NEWSEQUENTIALID()`).
- All money / quantity columns are `decimal(18,4)`.
- All timestamps in UTC, type `datetime2(7)`.
- Soft-delete columns: `IsDeleted bit`, `DeletedAtUtc datetime2 NULL`, `DeletedByUserId uniqueidentifier NULL`.
- Audit columns on every table: `CreatedAtUtc`, `CreatedByUserId`, `UpdatedAtUtc`, `UpdatedByUserId`.

## Mapping template (one section per legacy table)

### `dbo.LegacyItems` → `Items`

| Legacy column          | Type              | New column          | New type         | Transformation                          |
|------------------------|-------------------|---------------------|------------------|------------------------------------------|
| ItemID (int identity)  | int               | LegacyId            | int              | kept for traceability                    |
|                        |                   | Id                  | uniqueidentifier | NEWSEQUENTIALID()                        |
| ItemCode               | nvarchar(50)      | Sku                 | nvarchar(64)     | trim, upper-case                         |
| ItemName               | nvarchar(200)     | Name                | nvarchar(200)    | trim                                     |
| Category               | nvarchar(50)      | CategoryId          | uniqueidentifier | lookup by name in Categories             |
| UoM                    | nvarchar(10)      | UnitId              | uniqueidentifier | lookup by code in Units                  |
| StdCost                | money             | StandardCost        | decimal(18,4)    | direct                                   |
| SellPrice              | money             | StandardPrice       | decimal(18,4)    | direct                                   |
| Active                 | bit               | IsActive            | bit              | direct                                   |
| CreatedDate            | datetime          | CreatedAtUtc        | datetime2        | assume local-tz, convert to UTC          |

### Validation rules during ETL

- Unique on `(Sku)` — duplicates dumped to `etl-errors/items.csv` with reason.
- `StandardCost >= 0`, `StandardPrice >= 0`.
- `CategoryId` and `UnitId` must resolve, else dump to errors.

### Reconciliation

- Row count: `legacy COUNT(*) WHERE Active=1` == `new COUNT(*) WHERE IsDeleted=0`.
- Sum check: `SUM(StdCost * <on-hand>)` matches stock-value report ±0.01.

(Repeat for every entity: Suppliers, Customers, PurchaseOrders, GRNs, StockMovements, Invoices, Payments, Users, …)
