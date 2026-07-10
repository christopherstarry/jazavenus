# System module — `/api/system`

Monthly processing, day-end, document purge, backup, and restore stubs.

**Auth policy:** `RequireOperator` + `RequireModule("master")`. Most POST actions require Admin; backup/restore require SuperAdmin.

**Controller:** `SystemController`

Related process enqueue endpoints live under [integrations.md](integrations.md) (`/api/processes`).

---

## Route table

| Method | Path | Write policy | Notes |
|--------|------|--------------|-------|
| POST | `/api/system/monthly-process` | Admin | Month-end stub |
| POST | `/api/system/day-end` | Admin | Day-end stub |
| POST | `/api/system/delete-cancelled-document` | Admin | Purge cancelled docs |
| POST | `/api/system/backup` | SuperAdmin | Backup stub |
| POST | `/api/system/restore` | SuperAdmin | Restore stub |

---

## Happy path — day-end

```bash
curl -s -X POST https://localhost:5001/api/system/day-end \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Division: DISTRIBUTIONBDG" \
  -d '{ "businessDate": "2026-07-10" }'
```

```json
{
  "jobId": "019dfb8ae-cccc-7000-8000-000000000140",
  "processType": "day-end",
  "division": "DISTRIBUTIONBDG",
  "status": "Accepted",
  "message": "Day-end job queued for 2026-07-10."
}
```

---

## Error example — day-end already run (409)

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Day-end for DISTRIBUTIONBDG on 2026-07-10 has already completed.",
  "instance": "/api/system/day-end"
}
```

---

## See also

- [integrations.md](integrations.md)
- [settings.md](settings.md) — fiscal periods
