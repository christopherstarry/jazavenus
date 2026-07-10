# Authentication

Jaza Venus uses **ASP.NET Identity** for cookie sessions and **JWT bearer tokens** for programmatic clients. Both schemes are accepted on `[Authorize]` endpoints (`Program.cs` multi-scheme default policy).

---

## Cookie vs Bearer

| Aspect | Cookie (`jaza.auth`) | Bearer JWT |
|--------|----------------------|------------|
| Lifetime | 24 hours fixed (not sliding) | 15 minutes |
| Storage | HttpOnly, SameSite=Strict | Client memory / secure storage |
| Typical client | Browser SPA | Mobile, scripts, integrations |
| CSRF | Required on mutating requests | Not required |
| Obtained via | `POST /api/auth/login` (Set-Cookie) | `POST /api/auth/login` (response body) |

The SPA uses **both**: the cookie keeps reloads authenticated; the JWT is sent as `Authorization: Bearer` by the API client and rotated via refresh.

---

## Login flow

```
Client                          API
  |  POST /api/auth/login         |
  |  { email, password, mfaCode? }|
  |------------------------------>|
  |  200 LoginResponse            |
  |  Set-Cookie: jaza.auth        |
  |  Set-Cookie: jaza.xsrf        |
  |<------------------------------|
  |  GET /api/auth/me (optional)  |
  |------------------------------>|
```

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@jaza.local",
  "password": "ChangeMe123!",
  "mfaCode": null
}
```

### Success response (200)

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
  "permissions": { "modules": { "master": { "canEdit": true, "canDelete": true } }, "reports": ["sales", "inventory"], "isDeveloper": false },
  "preferences": { "language": "id", "textSize": "medium", "theme": "light" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expiresAtUtc": "2026-07-10T10:15:00Z"
}
```

### Failure responses

| Status | `title` | When |
|--------|---------|------|
| 401 | `invalid_credentials` | Bad email/password |
| 401 | `invalid_totp` | Wrong MFA code |
| 403 | `mfa_required` | MFA enabled but code omitted |
| 403 | `mfa_setup_required` | SuperAdmin without MFA (production) |
| 423 | `account_locked` | Identity lockout active |
| 429 | â€” | Login rate limit (10/min/IP) |

Rate limit policy name: `login`.

---

## MFA

| Step | Endpoint | Auth |
|------|----------|------|
| Generate TOTP key + QR | `POST /api/auth/mfa/init` | Yes |
| Confirm code, enable MFA | `POST /api/auth/mfa/confirm` | Yes |
| Login with MFA | `POST /api/auth/login` + `mfaCode` | Anonymous |

`POST /api/auth/mfa/confirm` returns 10 single-use backup codes (`MfaBackupCodesResponse`).

Production requires SuperAdmin accounts to enrol MFA before first login (`Auth:RequireSuperAdminMfa`).

---

## Refresh

Exchange a valid refresh token for a new access + refresh pair. Old refresh token is revoked (rotation).

```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..." }
```

| Status | Meaning |
|--------|---------|
| 200 | New `accessToken`, `refreshToken`, `expiresAtUtc`; cookie re-issued |
| 401 | `session_expired` â€” client must redirect to login |

Rate limit: `refresh` policy (30/min/user).

`SecurityVersion` rotation (password change, admin reset) invalidates **all** refresh tokens for that user immediately.

---

## Session endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/logout` | Yes | Revokes refresh tokens; clears cookie |
| GET | `/api/auth/me` | Yes | Profile + permissions + preferences |
| GET | `/api/auth/antiforgery` | Anonymous | Re-issues `jaza.xsrf` cookie |
| POST | `/api/auth/change-password` | SuperAdmin+ | Admin changes another user's password |
| POST | `/api/auth/me/change-password` | SuperAdmin+ | Self-service password change |

---

## Preferences

Per-user UI settings stored in `user_preferences`:

| Method | Path | Body fields |
|--------|------|-------------|
| GET | `/api/auth/preferences` | â€” |
| PUT | `/api/auth/preferences` | `language`, `textSize`, `theme` (all optional patch) |

Division for scoped users is also stored on preferences (`division` field) â€” see [conventions.md](conventions.md#division-scoping).

### Example

```bash
curl -s https://localhost:5001/api/auth/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Cookie: jaza.auth=$COOKIE"
```

```json
{ "language": "id", "textSize": "medium", "theme": "light" }
```

---

## CSRF

For cookie-based mutating requests:

```bash
# 1. Bootstrap antiforgery
curl -c cookies.txt https://localhost:5001/api/auth/antiforgery

# 2. Extract XSRF-TOKEN from cookies.txt, then:
curl -b cookies.txt -X POST https://localhost:5001/api/inbound/purchase-orders \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <value from jaza.xsrf cookie>" \
  -d '{ ... }'
```

Bearer-only clients omit `X-XSRF-TOKEN`.

---

## Further reading

- [../modules/auth/flow/how-sign-in-works.md](../modules/auth/flow/how-sign-in-works.md)
- [../modules/auth/flow/how-tokens-work.md](../modules/auth/flow/how-tokens-work.md)
- [../modules/auth/flow/mfa-and-security.md](../modules/auth/flow/mfa-and-security.md)
- [modules/auth.md](modules/auth.md) â€” route table and examples
