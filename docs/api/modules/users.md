# Users module — `/api/users`

User administration and per-user module/report permissions.

**Auth policy:** `RequireSuperAdmin` (Developer or SuperAdmin) on all routes.

---

## Route table

### UsersController — `/api/users`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/users` | Paged list (`page`, `pageSize`, `search`) |
| GET | `/api/users/{id}` | User + permissions snapshot |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| POST | `/api/users/{id}/reset-password` | Force password reset token |

### PermissionsController — `/api/users/{userId}/permissions`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/users/{userId}/permissions` | Module + report permissions |
| PUT | `/api/users/{userId}/permissions` | Replace all permissions |

---

## Happy path — create user

```bash
curl -s -X POST https://localhost:5001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $XSRF" \
  -b cookies.txt \
  -d '{
    "email": "sales1@jaza.local",
    "fullName": "Sales Staff",
    "roleId": 1,
    "isActive": true,
    "mustChangePassword": true
  }'
```

```json
{
  "id": "019dfb80a-1111-7000-8000-000000000099",
  "email": "sales1@jaza.local",
  "fullName": "Sales Staff",
  "role": "Sales",
  "isActive": true,
  "twoFactorEnabled": false,
  "mustChangePassword": true,
  "lastLoginAtUtc": null
}
```

---

## Error example — duplicate email (400)

User create/update returns **400** `email_in_use` (not 409). For a **409** example, concurrent permission updates may hit optimistic concurrency:

```bash
curl -s -X PUT "https://localhost:5001/api/users/$USER_ID/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "If-Match: \"stale-row-version\"" \
  -d '{
    "modules": [{ "module": "sales", "canEdit": true, "canDelete": false }],
    "reports": ["sales"]
  }'
```

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Concurrency conflict",
  "status": 409,
  "detail": "The record was modified by another user.",
  "instance": "/api/users/019dfb80a-1111-7000-8000-000000000099/permissions"
}
```

Duplicate email response (400):

```json
{
  "title": "email_in_use",
  "detail": "Email is already taken."
}
```

---

## See also

- [../authorization.md](../authorization.md)
- [auth.md](auth.md)
