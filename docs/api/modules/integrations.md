# Integrations module — `/api/integrations`, `/api/io`, `/api/processes`

External integration stubs, Excel import/export, and background process enqueue.

**Auth policy:**

| Prefix | Policy |
|--------|--------|
| `/api/io` | Admin + `master` module |
| `/api/integrations` | Operator + `master`; POST requires Admin |
| `/api/processes` | Operator + `sales`; enqueue requires Admin |

**Controllers:** `ImportExportController`, `IntegrationsController`, `ProcessesController`

---

## Route table — Import/export

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/io/items.xlsx` | Export items workbook |
| POST | `/api/io/items.xlsx` | Import items (`multipart/form-data`) |

## Route table — Integrations (stubs)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/integrations/semblog` | Semblog sync stub |
| POST | `/api/integrations/clipper` | Clipper export stub |
| POST | `/api/integrations/sms-orders` | SMS order intake stub |

## Route table — Processes

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/processes` | List in-memory job queue |
| POST | `/api/processes/auto-delivery` | Enqueue auto-DO job |
| POST | `/api/processes/auto-invoice` | Enqueue auto-invoice job |
| POST | `/api/processes/auto-delete` | Enqueue purge job |
| POST | `/api/processes/auto-po-from-so` | Enqueue auto-PO job |

---

## Happy path — export items

```bash
curl -s -o items.xlsx https://localhost:5001/api/io/items.xlsx \
  -H "Authorization: Bearer $TOKEN"
```

Returns `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (binary).

JSON acknowledgement after enqueue auto-invoice:

```bash
curl -s -X POST https://localhost:5001/api/processes/auto-invoice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "division": "DISTRIBUTIONBDG", "asOfDate": "2026-07-10" }'
```

```json
{
  "jobId": "019dfb88c-aaaa-7000-8000-000000000120",
  "processType": "auto-invoice",
  "status": "Queued",
  "queuedAtUtc": "2026-07-10T09:00:00Z"
}
```

---

## Error example — import row conflict (409)

Duplicate SKU in uploaded Excel when `updateExisting=false`:

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Row 12: SKU 'SKU-001' already exists. Enable updateExisting or remove duplicate.",
  "instance": "/api/io/items.xlsx"
}
```

---

## See also

- [system.md](system.md) — monthly/day-end jobs
- [master-data.md](master-data.md)
