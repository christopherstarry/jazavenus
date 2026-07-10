# PRD: Sales Reports Catalog

**Parent:** [report-screen-pattern.md](report-screen-pattern.md) | **Index:** [report-catalog.md](report-catalog.md)

All sales reports use `GET /api/reports/sales/{reportKey}`. UI follows [report-screen-pattern.md](report-screen-pattern.md).

**API keys:** 45 reports in `ReportCatalog` (domain `sales`).

---

## Common filters (all sales reports unless noted)

| Filter | Lookup | Required |
|--------|--------|----------|
| Date from / to | — | Yes |
| Division | division select | Yes |
| Customer | `customers` | Per report |
| Salesman | `salesmen` | Per report |
| Brand / Category | `brands` / `categories` | Per report |
| Warehouse | `warehouses` | Per report |

---

## Reports in module tree (wired routes)

| Report | API key | Route | Primary filters | Key columns |
|--------|---------|-------|-----------------|-------------|
| Report Selector | — | `/report/sales-report/report-selector` | — | Navigation cards |
| Product Selling Report | `product-selling` | `/report/sales-report/product-selling-report` | Date, Division, Brand, Category, Customer | Item, Qty, Amount, breakdown axes (checkboxes) |
| Sales Report | `sales-report` | `/report/sales-report/sales-report` | Date, Division, Customer, Salesman | Doc #, Date, Customer, Amount, Status |
| Detail Transaksi Penjualan | `detail-transaction` | `/report/sales-report/detail-transaction-report` | Date, Division, Customer, Item | Doc #, Line, Item, Qty, Price, Disc, Total |
| Recap by Brand | `recapitulation-sales-return-by-brand` | `.../recapitulation-sales-return/by-brand` | Date, Division, Brand | Brand, Sales Qty, Sales Amt, Return Qty, Return Amt, Net |
| Recap by Customer | `recapitulation-sales-return-by-customer` | `.../by-customer` | Date, Division, Customer | Customer, Sales, Returns, Net |
| Recap by Salesman | `recapitulation-sales-return-by-salesman` | `.../by-salesman` | Date, Division, Salesman | Salesman, Sales, Returns, Net |
| Recap by Customer+Status | `recapitulation-sales-return-by-customer-status` | `.../by-customer-with-status` | Date, Division, Status | Customer, Status, Amount |
| Sales Return Report | `sales-return-report` | `/report/sales-report/sales-return-report` | Date, Division, Customer | Return #, Date, Customer, Amount |
| Sales Bonus Report | `sales-bonus` | `/report/sales-report/sales-bonus-report` | Date, Division, Salesman | Salesman, Bonus Base, Bonus Amt |
| Sales Purchase Return | `sales-purchase-return` | `/report/sales-report/sales-purchase-return-report` | Date, Division | Combined sales/purchase return totals |
| Sales Time Series | `sales-time-series` | `/report/sales-report/sales-report-time-series` | Date range, Division, Interval | Period, Sales, Returns, Net |
| Daily Sales | `daily-sales` | `/report/sales-report/daily-sales-report` | Date, Division | Date, Invoice Count, Total Sales |
| Gross Margin | `gross-margin` | `/report/sales-report/gross-margin-report` | Date, Division, Brand | Item, Sales, COGS, Margin % |
| Makarizo Report | `makarizo` | `/report/sales-report/makarizo-report` | Date, Division, Customer (Makarizo) | Custom Makarizo columns |
| Customer By CA | `customer-by-ca` | `/report/sales-report/customer-by-ca` | Date, Division, Collector | Customer, CA, Outstanding |
| Cust # Outlets | `cust-number-of-outlet` | `/report/sales-report/cust-report-number-of-outlet` | Division, Class | Customer, Outlet Count |
| Sales By Market | `sales-by-market` | `/report/sales-report/sales-report-by-sales-market` | Date, Division, Area | Market, Sales Amt |
| Order Plan | `order-plan` | `/report/sales-report/order-plan-report` | Date, Division, Warehouse | Item, On Hand, Plan Qty |
| Service Level | `service-level` | `/report/sales-report/service-level` | Date, Division | Order Qty, Delivered Qty, SL % |
| Order vs Invoice | `check-order-vs-invoice` | `/report/sales-report/check-order-vs-invoice` | Date, Division, Customer | Order #, Ordered, Invoiced, Variance |
| Discount Per Customer | `discount-per-customer` | `/report/sales-report/laporan-discount-per-customer` | Date, Division, Customer | Customer, P1, P2, P3, Total Disc |

---

## Legacy-only reports (API key exists; add route or report selector link)

| Report | API key | Primary filters | Key columns |
|--------|---------|-----------------|-------------|
| Register Book | `register-book` | Date, Division, Doc type | Seq, Doc #, Date, Customer, Amount |
| Order Card | `order-card` | Date, Customer | Order #, Item, Qty, Status |
| Daily Selling | `daily-selling` | Date, Division | Date, Qty, Amount |
| Monthly Selling | `monthly-selling` | Year, Division | Month, Qty, Amount |
| Tax Invoice Summary | `tax-invoice-summary` | Date, Division | Faktur #, Invoice #, Tax |
| Trade Promo | `trade-promo` | Date, Division, Promo | Promo, Sales, Cost |
| Extra Discount Report | `extra-discount-report` | Date, Customer, Item | Customer, Item, P2/P3 Disc |
| Back Order | `back-order` | Date, Division, Customer | Order #, Item, Backorder Qty |
| Consignment Register | `consignment-register` | Date, Division, Warehouse | Doc #, Item, Qty |
| Invoice Register | `invoice-register` | Date, Division | Invoice #, Customer, Amount, Status |
| Delivery Order Register | `delivery-order-register` | Date, Division | DO #, Customer, Qty |
| Sales Order Register | `sales-order-register` | Date, Division | SO #, Customer, Amount, Status |
| Sales By Brand | `sales-by-brand` | Date, Division, Brand | Brand, Qty, Amount |
| Sales By Salesman | `sales-by-salesman` | Date, Division, Salesman | Salesman, Qty, Amount |
| Sales By Area | `sales-by-area` | Date, Division, Area | Area, Qty, Amount |
| Sales By Customer | `sales-by-customer` | Date, Division, Customer | Customer, Qty, Amount |
| Customer Statement | `customer-statement` | Date, Customer | Date, Doc, Debit, Credit, Balance |
| Salesman Target | `salesman-target` | Period, Salesman | Target, Actual, % |
| Top Customers | `top-customers` | Date, Division, Top N | Rank, Customer, Amount |
| Top Products | `top-products` | Date, Division, Top N | Rank, Item, Qty, Amount |
| Pending Delivery | `pending-delivery` | Division, Customer | SO #, Item, Pending Qty |
| Cancelled Orders | `cancelled-orders` | Date, Division | Order #, Cancel Date, Reason |
| Sales Comparison | `sales-comparison` | Two date ranges, Division | Period, Sales, Var % |
| Recapitulation (parent) | `recapitulation-sales-return` | Date, Division | Aggregated sales/return summary |

---

## Localization keys

Namespace prefix: `reports.sales.{reportKey}.*`

Example:
- `reports.sales.daily-sales.title` → id: "Laporan Penjualan Harian" / en: "Daily Sales Report"
- Column keys: `reports.sales.daily-sales.columns.date`, `.invoiceCount`, `.totalSales`

---

## Acceptance Criteria

1. All 45 API keys have UI spec row in this catalog
2. Module-tree reports use `LegacyReportPage` with matching `reportKey`
3. Legacy-only reports reachable via Report Selector until dedicated routes added
4. F5 execute, export, and filters per [report-screen-pattern.md](report-screen-pattern.md)
