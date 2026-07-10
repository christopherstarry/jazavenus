# PRD: Report Catalog

**Purpose:** Inventory all legacy reports vs new app status. Source: `frontend/src/app/modules.tsx` report tree + legacy `13-prd-reports.md`.

## Status legend

| Status | Meaning |
|--------|---------|
| **Live** | API + UI wired, produces data |
| **UI only** | Frontend shell, no API |
| **Placeholder** | Coming soon route |
| **Missing** | Not in new app |

---

## Sales Reports (`reportKey: sales`)

| Report | Route | API | Status |
|--------|-------|-----|--------|
| Report Selector | `/report/sales-report/report-selector` | — | UI only |
| Product Selling Report | `/report/sales-report/product-selling-report` | — | UI only |
| Sales Report | `/report/sales-report/sales-report` | — | Placeholder |
| Laporan Detail Transaksi Penjualan | `/report/sales-report/detail-transaction-report` | — | UI only |
| Recapitulation Sales and Return (×4 tabs) | `/report/sales-report/recapitulation-sales-return/*` | — | UI only |
| Sales Return Report | `/report/sales-report/sales-return-report` | — | Placeholder |
| Sales Bonus Report | `/report/sales-report/sales-bonus-report` | — | Placeholder |
| Sales Purchase Return Report | `/report/sales-report/sales-purchase-return-report` | — | Placeholder |
| Sales Report (Time Series) | `/report/sales-report/sales-report-time-series` | — | Placeholder |
| Daily Sales Report | `/report/sales-report/daily-sales-report` | — | Placeholder |
| Gross Margin Report | `/report/sales-report/gross-margin-report` | — | Placeholder |
| Makarizo Report | `/report/sales-report/makarizo-report` | — | Placeholder |
| Customer By CA | `/report/sales-report/customer-by-ca` | — | Placeholder |
| Cust Report Number Of Outlet | `/report/sales-report/cust-report-number-of-outlet` | — | Placeholder |
| Sales Report By Sales Market | `/report/sales-report/sales-report-by-sales-market` | — | Placeholder |
| Order Plan Report | `/report/sales-report/order-plan-report` | — | Placeholder |
| Service Level | `/report/sales-report/service-level` | — | Placeholder |
| Check order Vs Invoice | `/report/sales-report/check-order-vs-invoice` | — | Placeholder |
| Laporan Discount Per Customer | `/report/sales-report/laporan-discount-per-customer` | — | Placeholder |

**Legacy-only (not in module tree):** Register book, order card, daily/monthly selling, tax invoice print, trade promo, back order, consignment registers (~25 more).

---

## Inventory Reports (`reportKey: inventory`)

| Report | Route | API | Status |
|--------|-------|-----|--------|
| Process | `/report/inventory-report/process` | — | Placeholder |
| Stock Position Report | `/report/inventory-report/stock-position-report` | `reports/stock-card` partial | UI only |
| Stock Mutation Report | `/report/inventory-report/stock-mutation-report` | `reports/daily-movements` partial | Placeholder |
| Product Report (Price List) | `/report/inventory-report/product-report-price-list` | — | Placeholder |
| SKU Stock Report | `/report/inventory-report/sku-stock-report` | `reports/low-stock` partial | Placeholder |
| Stock Opname Report | `/report/inventory-report/stock-opname-report` | — | Placeholder |
| BPB Report | `/report/inventory-report/bpb-report` | — | Placeholder |
| BBK Report | `/report/inventory-report/bbk-report` | — | Placeholder |
| Transfer Report | `/report/inventory-report/transfer-report` | — | Placeholder |

**Legacy-only:** Stock card, combined stock, monthly trial, consignment stock (~12 more).

---

## Purchase Reports (`reportKey: purchase`)

| Report | Route | Status |
|--------|-------|--------|
| Purchase Report | `/report/purchase-reports/purchase-report` | Placeholder |
| Purchase Bonus Report | `/report/purchase-reports/purchase-bonus-report` | Placeholder |
| Daily Purchase Report | `/report/purchase-reports/daily-purchase-report` | Placeholder |
| Purchase Service Level | `/report/purchase-reports/purchase-service-level` | Placeholder |

---

## A/R Reports (`reportKey: ar`)

| Report | Route | Status |
|--------|-------|--------|
| Collection Report | `/report/account-receivable-reports/collection-report` | Placeholder |
| Outstanding Invoice Report | `/report/account-receivable-reports/outstanding-invoice-report` | Placeholder |
| Receipt Report | `/report/account-receivable-reports/receipt-report` | Placeholder |
| DOAR Report | `/report/account-receivable-reports/doar-report` | Placeholder |
| Outstanding PDC Report | `/report/account-receivable-reports/outstanding-pdc-report` | Placeholder |

**Legacy-only:** Aging, giro tracking, credit memo, A/R confirmation, cross-checks (~20 more).

---

## Implemented report APIs (backend)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/reports/stock-card` | Stock movement history |
| `GET /api/reports/low-stock` | Items below min level |
| `GET /api/reports/daily-movements` | Daily stock movements |
| `GET /api/reports/financial-summary` | Dashboard metrics |

---

## Migration strategy

1. **Phase 1 (MVP):** Daily sales, stock position, outstanding invoices, collection — SQL views replacing top Crystal Reports.
2. **Phase 2:** Recapitulation, gross margin, BPB/BBK, transfer reports.
3. **Phase 3:** Customer-specific (Makarizo), time series, service level, Clipper/DTS replacements.

**Crystal Reports:** ~550 `.rpt` files with embedded SQL — each requires manual SQL extraction and API endpoint design. See legacy `PrintForms.bas` / `SetLocationMdl.bas` for report parameter mapping.

---

## Common report parameters (legacy)

| Parameter | Type | Used by |
|-----------|------|---------|
| Date from / to | date | Most reports |
| Division | string | All transactional |
| Customer / Supplier | code | Detail reports |
| Brand / Category | code | Product reports |
| Warehouse | code | Inventory reports |
| Salesman / Collector | code | Sales/A/R reports |

New app should expose these as query params on `/api/reports/{name}`.
