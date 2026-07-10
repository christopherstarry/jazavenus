# PRD: Purchase Reports Catalog

**Parent:** [report-screen-pattern.md](report-screen-pattern.md) | **Index:** [report-catalog.md](report-catalog.md)

All purchase reports use `GET /api/reports/purchase/{reportKey}`.

**API keys:** 6 reports in `ReportCatalog` (domain `purchase`).

---

## Common filters

| Filter | Lookup | Required |
|--------|--------|----------|
| Date from / to | — | Yes |
| Division | division select | Yes |
| Supplier | `suppliers` | Most reports |
| Warehouse | `warehouses` | Per report |

---

## Reports

| Report | API key | Route | Primary filters | Key columns |
|--------|---------|-------|-----------------|-------------|
| Purchase Report | `purchase-report` | `/report/purchase-reports/purchase-report` | Date, Division, Supplier | PO #, Date, Supplier, Amount, Status |
| Purchase Bonus | `purchase-bonus` | `/report/purchase-reports/purchase-bonus-report` | Date, Division, Supplier | Supplier, Bonus Base, Bonus Amt |
| Daily Purchase | `daily-purchase` | `/report/purchase-reports/daily-purchase-report` | Date, Division | Date, PO Count, Total Amount |
| Purchase Service Level | `purchase-service-level` | `/report/purchase-reports/purchase-service-level` | Date, Division, Supplier | Ordered Qty, Received Qty, SL % |
| Purchase Recapitulation | `purchase-recapitulation` | *(report selector)* | Date, Division, Supplier | Supplier, PO Amt, GRN Amt, Return Amt, Net |
| Purchase Return Register | `purchase-return-register` | *(report selector)* | Date, Division, Supplier | Return #, Date, Supplier, Amount |

---

## Localization keys

Namespace: `reports.purchase.{reportKey}.*`

Example: `reports.purchase.purchase-report.title` → id: "Laporan Pembelian" / en: "Purchase Report"

---

## Acceptance Criteria

1. All 6 API keys have UI spec
2. Module-tree placeholders wired to `LegacyReportPage` with correct `reportKey`
3. Recapitulation and return register added to report selector
