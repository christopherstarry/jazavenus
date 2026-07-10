# Audit module — `/api/audit-logs`, `/api/error-logs`

Activity audit trail (SuperAdmin) and server error diagnostics (Developer).

**Auth policy:**

| Controller | Policy |
|------------|--------|
| AuditLogsController | `RequireSuperAdmin` |
| ErrorLogsController | `RequireDeveloper` |

---

## Route table

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/audit-logs` | Paged search — `page`, `pageSize`, `from`, `to`, `module`, `action`, `userId`, `search` |
| GET | `/api/audit-logs/{id}` | Single audit entry |
| GET | `/api/error-logs` | Paged error log search |
| GET | `/api/error-logs/{id}` | Error detail with stack trace |

Auth events (login, logout, MFA, password changes) are written to `audit_logs` with `module=system`.

---

## Happy path — search audit logs

```bash
curl -s "https://localhost:5001/api/audit-logs?module=purchase&action=PurchaseOrder.Posted&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "items": [
    {
      "id": "019dfb89d-bbbb-7000-8000-000000000130",
      "occurredAtUtc": "2026-07-10T08:45:00Z",
      "action": "PurchaseOrder.Posted",
      "entity": "PurchaseOrder",
      "entityId": "019dfb82c-3333-7000-8000-000000000060",
      "entityCode": "PO-2026-0042",
      "module": "purchase",
      "userId": "019dfb7d-1925-72ad-81ba-b7c5b34d6b7e",
      "userName": "admin@jaza.local",
      "ipAddress": "127.0.0.1",
      "notes": null
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

---

## Error example — duplicate audit export job (409)

Re-requesting a bulk export while one is in progress (system stub):

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Audit export for range 2026-07-01–2026-07-10 is already running.",
  "instance": "/api/audit-logs"
}
```

---

## See also

- [../database/audit-and-history.md](../database/audit-and-history.md)
- [auth.md](auth.md) — auth audit events
