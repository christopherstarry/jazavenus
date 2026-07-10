# PRD: Inventory Reports Catalog

**Parent:** [report-screen-pattern.md](report-screen-pattern.md) | **Index:** [report-catalog.md](report-catalog.md)

All inventory reports use `GET /api/reports/inventory/{reportKey}` (except built-in shortcuts below).

**API keys:** 25 reports in `ReportCatalog` (domain `inventory`).

**Built-in shortcuts:** `GET /api/reports/stock-card`, `low-stock`, `daily-movements` — map to `stock-card`, `sku-stock`, `stock-mutation` keys.

---

## Common filters

| Filter | Lookup | Required |
|--------|--------|----------|
| Date from / to | — | Most reports |
| Division | division select | Yes |
| Warehouse | `warehouses` | Most reports |
| Item / Brand / Category | lookups | Per report |

---

## Reports in module tree

| Report | API key | Route | Primary filters | Key columns |
|--------|---------|-------|-----------------|-------------|
| Process | `inventory-process` | `/report/inventory-report/process` | Division, Period | Process step, Status |
| Stock Position | `stock-position` | `/report/inventory-report/stock-position-report` | Division, Warehouse, Brand | Item, On Hand, Committed, Available |
| Stock Mutation | `stock-mutation` | `/report/inventory-report/stock-mutation-report` | Date, Division, Warehouse, Item | Date, Doc, In, Out, Balance |
| Product Price List | `product-price-list` | `/report/inventory-report/product-report-price-list` | Division, Brand, Price tier | Item, UOM, HJP, HPD, HET |
| SKU Stock | `sku-stock` | `/report/inventory-report/sku-stock-report` | Division, Warehouse | Item, SKU, Qty, Min, Max |
| Stock Opname | `stock-opname` | `/report/inventory-report/stock-opname-report` | Date, Division, Warehouse | Item, Expected, Actual, Variance |
| BPB Report | `bpb-report` | `/report/inventory-report/bpb-report` | Date, Division, Warehouse | BPB #, Date, Item, Qty |
| BBK Report | `bbk-report` | `/report/inventory-report/bbk-report` | Date, Division, Warehouse | BBK #, Date, Item, Qty |
| Transfer Report | `transfer-report` | `/report/inventory-report/transfer-report` | Date, Division | Transfer #, From, To, Item, Qty |

---

## Legacy-only reports (API key exists)

| Report | API key | Primary filters | Key columns |
|--------|---------|-----------------|-------------|
| Stock Card | `stock-card` | Date, Item, Warehouse | Date, Doc, In, Out, Balance |
| Combined Stock | `combined-stock` | Division, Warehouses (multi) | Item, Total Qty by warehouse |
| Monthly Trial | `monthly-trial` | Year, Month, Division | Item, Opening, In, Out, Closing |
| Consignment Stock | `consignment-stock` | Division, Warehouse | Item, Consignment Qty |
| Stock Valuation | `stock-valuation` | Date, Division, Warehouse | Item, Qty, Unit Cost, Value |
| Slow Moving | `slow-moving` | Date range, Division, Days threshold | Item, Last movement, Qty |
| Fast Moving | `fast-moving` | Date range, Division | Item, Turnover, Qty |
| Location Stock | `location-stock` | Warehouse, Location | Item, Bin, Qty |
| Warehouse Summary | `warehouse-summary` | Division, Date | Warehouse, SKU count, Total value |
| Negative Stock | `negative-stock` | Division | Item, Warehouse, Qty (negative) |
| Reorder Suggestion | `reorder-suggestion` | Division, Warehouse | Item, On Hand, Min, Suggested Qty |
| Goods Receipt Register | `goods-receipt-register` | Date, Division | GRN #, Supplier, Amount |
| Goods Issue Register | `goods-issue-register` | Date, Division | Issue #, Type, Qty |
| Movement Summary | `movement-summary` | Date, Division, Movement type | Type, Count, Total Qty |
| Expiry Tracking | `expiry-tracking` | Division, Days to expiry | Item, Batch, Expiry, Qty |
| Stock Aging | `stock-aging` | Division, Warehouse, Age buckets | Item, Age bucket, Qty |

---

## Localization keys

Namespace: `reports.inventory.{reportKey}.*`

Example: `reports.inventory.stock-position.title` → id: "Laporan Posisi Stok" / en: "Stock Position Report"

---

## Acceptance Criteria

1. All 25 API keys documented
2. Stock card / mutation reports wire to existing partial APIs where available
3. BPB/BBK/Transfer reports align with inventory transaction PRDs
