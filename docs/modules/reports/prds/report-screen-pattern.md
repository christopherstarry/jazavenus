# PRD: Report Screen Pattern

## Summary

Shared UI template for all ~90 legacy reports in the new React shell. Filter panel + output grid + export + legacy beige chrome. Individual report specs live in domain catalogs: [sales-reports.md](sales-reports.md), [inventory-reports.md](inventory-reports.md), [purchase-reports.md](purchase-reports.md), [ar-reports.md](ar-reports.md).

**Legacy reference:** Report forms in `UI\Forms\`, `legacySalesReportChrome.tsx`, `PrintForms.bas`.

---

## Screens & URLs

| Pattern | Route prefix | Example |
|---------|--------------|---------|
| Sales reports | `/report/sales-report/*` | `/report/sales-report/daily-sales-report` |
| Inventory | `/report/inventory-report/*` | `/report/inventory-report/stock-position-report` |
| Purchase | `/report/purchase-reports/*` | `/report/purchase-reports/purchase-report` |
| A/R | `/report/account-receivable-reports/*` | `/report/account-receivable-reports/collection-report` |

---

## Component structure

```tsx
<LegacyReportPage
  reportKey="sales.daily"
  title={t("reports.sales.daily.title")}
  filters={filterConfig}
  columns={columnConfig}
  apiPath="/api/reports/sales/daily"
/>
```

Reuse [legacySalesReportChrome.tsx](../../../frontend/src/features/reports/legacySalesReportChrome.tsx) for beige header/tabs where `legacyReportTabsChrome` is set in `modules.tsx`.

---

## UI Behavior

### Toolbar â€” mode `process`

- [ ] **F5** Execute / Run Report ([transaction-toolbar-and-shortcuts.md](../../shared/ui-foundation/transaction-toolbar-and-shortcuts.md))
- [ ] **Export** dropdown: CSV, Excel (xlsx), PDF (when API supports)
- [ ] **Print** â€” browser print of results grid
- [ ] **Esc** â€” clear results or navigate back

### Filter panel (common parameters)

| Filter | Control | Lookup type |
|--------|---------|-------------|
| Date from / to | date pickers | â€” |
| Division | select | division scope |
| Customer | code + magnifier | `customers` |
| Supplier | code + magnifier | `suppliers` |
| Item / Brand / Category | magnifier | `items` / `brands` / `categories` |
| Warehouse | magnifier | `warehouses` |
| Salesman / Collector | magnifier | `salesmen` / `collectors` |
| Document status | multi-select | `documentStatus.*` i18n |

- [ ] **Auto-run** checkbox (default off) â€” run on filter change when checked
- [ ] Collapsible filter panel on mobile

### Output area

- [ ] Read-only data grid â€” `@tanstack/react-table`
- [ ] Column sort client-side when < 1000 rows; server-side sort param otherwise
- [ ] Pagination: 50/100/500 rows
- [ ] Grand total row when report has numeric aggregates
- [ ] Empty: "Tidak ada data untuk filter ini" before first run vs after run

### States

- [ ] Loading skeleton on F5 execute
- [ ] Error banner with API `detail`
- [ ] Stale results cleared when filters change (unless auto-run)

### Report selector

- [ ] `/report/sales-report/report-selector` â€” card grid linking to all sales reports (existing `ReportSelectorPage`)

---

## API contract

```
GET /api/reports/{domain}/{reportKey}?dateFrom=&dateTo=&division=&...&page=1&pageSize=50
â†’ { items: Row[], total: number, aggregates?: Record<string, number> }
```

Export:
```
GET /api/reports/{domain}/{reportKey}/export?format=xlsx|csv|pdf&...
â†’ file download
```

---

## Permissions

Per `reportKey` in `modules.tsx` â€” user must have report module visibility. Division filter enforced server-side.

---

## Localization keys

Namespace: `reports.common.*`

| Key | id | en |
|-----|-----|-----|
| `reports.common.run` | Jalankan | Run |
| `reports.common.export` | Ekspor | Export |
| `reports.common.dateFrom` | Dari Tanggal | Date From |
| `reports.common.dateTo` | Sampai Tanggal | Date To |
| `reports.common.noData` | Tidak ada data. | No data found. |
| `reports.common.autoRun` | Jalankan Otomatis | Auto Run |

Per-report keys: `reports.{domain}.{reportKey}.title` and `.columns.*`

---

## How This Matches Existing Patterns

- Chrome: `legacySalesReportChrome.tsx`
- Lookup filters: [lookup-browse-dialog.md](../../shared/ui-foundation/lookup-browse-dialog.md)
- Toolbar: process mode
- i18n: [i18n-framework.md](../../shared/localization/i18n-framework.md)
- Routes: [modules.tsx](../../../frontend/src/app/modules.tsx) report tree

---

## Acceptance Criteria

1. All reports use `LegacyReportPage` or documented variant
2. Common filters and F5 execute behave consistently
3. Export produces same data as on-screen grid
4. Legacy beige chrome on tabbed reports (recapitulation)
