# Settings module — `/api/settings`

Company profile, fiscal periods, order codes, and return codes.

**Auth policy:** `RequireOperator` + `RequireModule("master")`. Mutations require Admin.

**Controller:** `SettingsController`

---

## Route table

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/settings/company` | — |
| PUT | `/api/settings/company` | Admin |
| GET | `/api/settings/fiscal-periods` | — |
| GET | `/api/settings/fiscal-periods/{id}` | — |
| POST | `/api/settings/fiscal-periods` | Admin |
| PUT | `/api/settings/fiscal-periods/{id}` | Admin |
| DELETE | `/api/settings/fiscal-periods/{id}` | Admin |
| GET | `/api/settings/order-codes` | — |
| GET | `/api/settings/order-codes/{id}` | — |
| POST | `/api/settings/order-codes` | Admin |
| PUT | `/api/settings/order-codes/{id}` | Admin |
| DELETE | `/api/settings/order-codes/{id}` | Admin |
| GET | `/api/settings/return-codes` | — |
| GET | `/api/settings/return-codes/{id}` | — |
| POST | `/api/settings/return-codes` | Admin |
| PUT | `/api/settings/return-codes/{id}` | Admin |
| DELETE | `/api/settings/return-codes/{id}` | Admin |

---

## Happy path — get company settings

```bash
curl -s https://localhost:5001/api/settings/company \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "legalName": "PT Jaza Venus",
  "taxId": "01.234.567.8-901.000",
  "address": "Jl. Contoh No. 1, Bandung",
  "defaultCurrency": "IDR",
  "defaultDivision": "DISTRIBUTIONBDG",
  "fiscalYearStartMonth": 1
}
```

---

## Error example — overlapping fiscal period (409)

```bash
curl -s -X POST https://localhost:5001/api/settings/fiscal-periods \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "2026-07",
    "startDate": "2026-07-01T00:00:00Z",
    "endDate": "2026-07-31T23:59:59Z",
    "isClosed": false
  }'
```

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Fiscal period dates overlap with existing period 2026-07.",
  "instance": "/api/settings/fiscal-periods"
}
```

---

## See also

- [master-data.md](master-data.md)
- [../conventions.md](../conventions.md)
