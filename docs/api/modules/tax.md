# Tax module — `/api/tax/serials`

Faktur Pajak (tax invoice) serial number pool management.

**Auth policy:** `RequireOperator` + `RequireModule("sales")`. Create/update/delete requires Admin.

**Controller:** `TaxSerialsController`

Master tax registrations live under `/api/master/tax-registrations` ([master-data.md](master-data.md)).

---

## Route table

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/tax/serials` | — |
| GET | `/api/tax/serials/{id}` | — |
| POST | `/api/tax/serials` | Admin |
| PUT | `/api/tax/serials/{id}` | Admin (available only) |
| DELETE | `/api/tax/serials/{id}` | Admin (available only) |

Serials transition to `Used` when an invoice is posted (`POST /api/invoices/{id}/post`).

---

## Happy path — register serial range

```bash
curl -s -X POST https://localhost:5001/api/tax/serials \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taxRegistrationId": "019dfb7d-0200-7000-8000-000000000020",
    "serialFrom": "010.000-26.00000100",
    "serialTo": "010.000-26.00000199",
    "receivedDate": "2026-07-01T00:00:00Z"
  }'
```

```json
{
  "id": "019dfb87b-9999-7000-8000-000000000110",
  "taxRegistrationId": "019dfb7d-0200-7000-8000-000000000020",
  "serialFrom": "010.000-26.00000100",
  "serialTo": "010.000-26.00000199",
  "status": "Available",
  "nextSerial": "010.000-26.00000100",
  "remainingCount": 100
}
```

---

## Error example — duplicate serial range (409)

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Serial range overlaps with existing batch 010.000-26.00000001–010.000-26.00000100.",
  "instance": "/api/tax/serials"
}
```

---

## See also

- [invoicing.md](invoicing.md) — serial consumption on post
- [reports.md](reports.md) — `sales:tax-invoice-summary`
