# PRD: A/R Reports Catalog

**Parent:** [report-screen-pattern.md](report-screen-pattern.md) | **Index:** [report-catalog.md](report-catalog.md)

All A/R reports use `GET /api/reports/ar/{reportKey}`.

**API keys:** 23 reports in `ReportCatalog` (domain `ar`).

**Built-in:** `GET /api/reports/financial-summary` (SuperAdmin dashboard metrics).

---

## Common filters

| Filter | Lookup | Required |
|--------|--------|----------|
| Date from / to | — | Most reports |
| Division | division select | Yes |
| Customer | `customers` | Per report |
| Collector | `collectors` | Per report |
| Bank | `banks` | PDC/cheque reports |

---

## Reports in module tree

| Report | API key | Route | Primary filters | Key columns |
|--------|---------|-------|-----------------|-------------|
| Collection Report | `collection` | `/report/account-receivable-reports/collection-report` | Date, Division, Collector | Date, Customer, Receipt #, Amount |
| Outstanding Invoice | `outstanding-invoice` | `.../outstanding-invoice-report` | Division, Customer, As-of date | Invoice #, Date, Due, Outstanding |
| Receipt Report | `receipt-report` | `.../receipt-report` | Date, Division, Customer | Receipt #, Date, Cash, Transfer, Giro |
| DOAR Report | `doar` | `.../doar-report` | Date, Division | DO #, Invoice status, AR impact |
| Outstanding PDC | `outstanding-pdc` | `.../outstanding-pdc-report` | Division, Bank, Due date | Giro #, Customer, Amount, Due |

---

## Legacy-only reports (API key exists)

| Report | API key | Primary filters | Key columns |
|--------|---------|-----------------|-------------|
| Aging | `aging` | As-of date, Division, Customer | Customer, Current, 30, 60, 90+, Total |
| Giro Due | `giro-due` | Date range, Division, Bank | Giro #, Due date, Amount, Customer |
| Credit Adjustment | `credit-adjustment` | Date, Division | Adj #, Customer, Amount |
| AR Confirmation | `ar-confirmation` | Period, Division | Customer, Confirmed balance |
| Payment Allocation | `payment-allocation` | Date, Customer | Receipt #, Invoice #, Allocated |
| Customer Balance | `customer-balance` | Division, Customer | Customer, Balance, Credit limit |
| Invoice Aging Detail | `invoice-aging-detail` | As-of, Customer | Invoice #, Days overdue, Amount |
| Collector Performance | `collector-performance` | Date, Collector | Collector, Target, Collected, % |
| Cheque Register | `cheque-register` | Date, Division, Bank | Giro #, Status, Amount |
| Credit Memo Register | `credit-memo-register` | Date, Division | CM #, Customer, Amount |
| AR Cross Check | `ar-cross-check` | Period, Division | Customer, Ledger, Statement, Variance |
| Payment Register | `payment-register` | Date, Division | Receipt #, Customer, Method, Amount |
| Overdue Summary | `overdue-summary` | Division, Min days | Customer, Overdue count, Amount |
| Customer Ledger | `customer-ledger` | Date, Customer | Date, Doc, Debit, Credit, Balance |
| Write-off Register | `write-off-register` | Date, Division | Customer, Amount, Reason |
| PDC Clearance | `pdc-clearance` | Date, Division | Giro #, Clear date, Amount |
| AR Period Close | `ar-period-close` | Year, Month, Division | Period, Status, Closed date |
| Receipt Allocation | `receipt-allocation` | Date, Receipt # | Invoice lines, Allocated amounts |

---

## Localization keys

Namespace: `reports.ar.{reportKey}.*`

Use `pdcStatus.*` for giro status columns. Example: `reports.ar.aging.title` → id: "Laporan Umur Piutang" / en: "A/R Aging Report"

---

## Acceptance Criteria

1. All 23 API keys documented
2. PDC/collection reports align with [payment-receipt.md](../ar/payment-receipt.md) and [pdc-clearance.md](../ar/pdc-clearance.md)
3. Aging and outstanding invoice are Phase 1 MVP per [report-catalog.md](report-catalog.md) migration strategy
