# Auth module — `/api/auth`

Authentication, session management, MFA, and user preferences.

**Auth policy:** Mixed — login/refresh/antiforgery are anonymous; other routes require authenticated user. Password admin routes require `RequireSuperAdmin`.

---

## Route table

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/login` | Anonymous | Rate limit `login`; sets cookies + returns JWT |
| POST | `/api/auth/logout` | Yes | Revokes refresh tokens |
| POST | `/api/auth/refresh` | Anonymous | Rate limit `refresh`; rotates tokens |
| GET | `/api/auth/me` | Yes | Profile + permissions + preferences |
| GET | `/api/auth/antiforgery` | Anonymous | Issues `jaza.xsrf` cookie |
| POST | `/api/auth/change-password` | SuperAdmin+ | Admin resets another user |
| POST | `/api/auth/me/change-password` | SuperAdmin+ | Self-service password change |
| POST | `/api/auth/mfa/init` | Yes | Start TOTP enrolment |
| POST | `/api/auth/mfa/confirm` | Yes | Enable MFA + backup codes |
| GET | `/api/auth/preferences` | Yes | Read UI preferences |
| PUT | `/api/auth/preferences` | Yes | Patch preferences |

CSRF: login and refresh use `[IgnoreAntiforgeryToken]`. All other mutating routes require `X-XSRF-TOKEN` for cookie clients.

---

## Happy path — login

```bash
curl -s -c cookies.txt -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jaza.local",
    "password": "ChangeMe123!",
    "mfaCode": null
  }'
```

```json
{
  "user": {
    "id": "019dfb7d-1925-72ad-81ba-b7c5b34d6b7e",
    "email": "admin@jaza.local",
    "fullName": "Admin User",
    "role": "Admin",
    "isDeveloper": false,
    "twoFactorEnabled": false,
    "mustChangePassword": false
  },
  "permissions": {
    "modules": {
      "master": { "canEdit": true, "canDelete": true },
      "purchase": { "canEdit": true, "canDelete": true }
    },
    "reports": ["sales", "inventory", "purchase", "ar"],
    "isDeveloper": false
  },
  "preferences": { "language": "id", "textSize": "medium", "theme": "light" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64url-token...",
  "expiresAtUtc": "2026-07-10T10:15:00Z"
}
```

---

## Error example — invalid credentials (401)

Auth routes do not emit **409**. The closest operational failure on login is invalid credentials:

```bash
curl -s -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@jaza.local", "password": "wrong" }'
```

```json
{
  "type": "https://docs.jaza.local/errors/invalid_credentials",
  "title": "invalid_credentials",
  "detail": "Email atau password salah."
}
```

For **409 Conflict** patterns on session-adjacent flows, see refresh after `SecurityVersion` rotation (returns **401** `session_expired`) or [users.md](users.md) for duplicate email on user create.

---

## See also

- [../authentication.md](../authentication.md)
- [../errors.md](../errors.md)
