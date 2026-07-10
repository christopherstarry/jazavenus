# Reports module — `/api/reports`

Built-in inventory/AR shortcuts and dynamic report executors by domain.

**Auth policy:** `RequireOperator` + per-report `[RequireReport(type)]`. Financial summary also requires SuperAdmin.

**Controllers:** `ReportsController`, `SalesReportsController`, `InventoryReportsController`, `PurchaseReportsController`, `ArReportsController`

---

## Route table — built-in (`ReportsController`)

| Method | Path | Report permission | Extra policy |
|--------|------|-------------------|--------------|
| GET | `/api/reports/stock-card` | inventory | — |
| GET | `/api/reports/low-stock` | inventory | — |
| GET | `/api/reports/daily-movements` | inventory | — |
| GET | `/api/reports/financial-summary` | ar | SuperAdmin |

Query params: `ReportQueryParams` — `page`, `pageSize` (max 500), `from`, `to`, `division`, entity-specific filters.

## Route table — dynamic executors

| Method | Path | Report permission |
|--------|------|-------------------|
| GET | `/api/reports/sales/{reportKey}` | sales |
| GET | `/api/reports/inventory/{reportKey}` | inventory |
| GET | `/api/reports/purchase/{reportKey}` | purchase |
| GET | `/api/reports/ar/{reportKey}` | ar |

### Sample report keys

| Domain | Example keys |
|--------|--------------|
| sales | `register-book`, `invoice-register`, `sales-by-customer`, `top-products` |
| inventory | `stock-card`, `stock-mutation`, `bpb-report`, `bbk-report`, `slow-moving` |
| purchase | `purchase-report`, `purchase-recapitulation`, `purchase-return-register` |
| ar | `aging`, `outstanding-invoice`, `payment-register`, `pdc-clearance`, `customer-ledger` |

Full catalog: 94 keys in `Jaza.Infrastructure.Reports.ReportCatalog`.

---

## Happy path — stock card

```bash
curl -s "https://localhost:5001/api/reports/stock-card?itemId=019dfb7d-0003-7000-8000-000000000003&warehouseId=019dfb7d-0002-7000-8000-000000000002&from=2026-07-01&to=2026-07-10&page=1&pageSize=100" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "reportKey": "inventory:stock-card",
  "columns": [
    { "key": "date", "label": "Date", "type": "date" },
    { "key": "documentNo", "label": "Document", "type": "string" },
    { "key": "qtyIn", "label": "In", "type": "decimal" },
    { "key": "qtyOut", "label": "Out", "type": "decimal" },
    { "key": "balance", "label": "Balance", "type": "decimal" }
  ],
  "rows": [
    {
      "date": "2026-07-10",
      "documentNo": "GRN-2026-0088",
      "qtyIn": 100,
      "qtyOut": 0,
      "balance": 176
    }
  ],
  "totalCount": 15,
  "page": 1,
  "pageSize": 100
}
```

---

## Error example — unknown report key (409)

```bash
curl -s "https://localhost:5001/api/reports/sales/not-a-real-report" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Business rule violated",
  "status": 409,
  "detail": "Unknown report key 'not-a-real-report' for domain sales.",
  "instance": "/api/reports/sales/not-a-real-report"
}
```

---

## See also

- [../testing-strategy.md](../testing-strategy.md) — report test matrix
- [../legacy-endpoint-map.md](../legacy-endpoint-map.md)
