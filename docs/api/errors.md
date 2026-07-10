# Errors and status codes

Jaza Venus APIs return [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807) (`application/problem+json`) for most error responses. Controllers may also return inline `ProblemDetails` for domain-specific cases (e.g. duplicate customer NIK).

---

## ProblemDetails shape

```json
{
  "type": "https://httpstatuses.io/400",
  "title": "Validation failed",
  "status": 400,
  "detail": "Only draft POs can be updated.",
  "instance": "/api/inbound/purchase-orders/019dfb7d-1925-72ad-81ba-b7c5b34d6b7e"
}
```

Auth endpoints use machine-readable `title` codes instead of generic titles:

```json
{
  "type": "https://docs.jaza.local/errors/invalid_credentials",
  "title": "invalid_credentials",
  "detail": "Email atau password salah."
}
```

FluentValidation failures include an `errors` extension:

```json
{
  "type": "https://httpstatuses.io/400",
  "title": "Validation failed",
  "status": 400,
  "detail": "Validation failed",
  "errors": {
    "Email": ["'Email' is not a valid email address."],
    "Lines": ["'Lines' must not be empty."]
  }
}
```

---

## Global exception mapping

`GlobalExceptionHandler` maps unhandled exceptions:

| Exception | Status | `title` |
|-----------|--------|---------|
| `DomainException` | 400 | Business rule violated |
| `FluentValidation.ValidationException` | 400 | Validation failed |
| `UnauthorizedAccessException` | 401 | Unauthorized |
| `KeyNotFoundException` | 404 | Not found |
| `DbUpdateConcurrencyException` | 409 | Concurrency conflict |
| Other | 500 | Server error |

500-level errors are persisted to `error_logs` (Developer role can query via `/api/error-logs`).

In **Development**, `detail` may include stack traces. In **Production**, only the exception message is exposed.

---

## Common HTTP status codes

| Code | When |
|------|------|
| **200** | Success with body |
| **201** | Created (rare; most creates return 200 + DTO) |
| **204** | Success without body (logout, antiforgery bootstrap) |
| **400** | Validation failure, business rule violation, bad request body |
| **401** | Not authenticated, invalid credentials, expired refresh token |
| **403** | Authenticated but forbidden (role, module, report, division, MFA required) |
| **404** | Entity not found |
| **409** | Explicit conflict (duplicate key) or optimistic concurrency |
| **423** | Account locked (Identity lockout) |
| **429** | Rate limit exceeded (`login`, `refresh`, global IP limiter) |
| **500** | Unhandled server error |

---

## Controller-specific error codes

### Authentication (`/api/auth`)

| Status | `title` | Detail |
|--------|---------|--------|
| 401 | `invalid_credentials` | Bad email/password |
| 401 | `invalid_totp` | Wrong MFA code |
| 401 | `session_expired` | Refresh token invalid/expired |
| 401 | `invalid_current_password` | Self password change |
| 403 | `mfa_required` | MFA enabled, code omitted |
| 403 | `mfa_setup_required` | SuperAdmin must enrol MFA |
| 400 | `validation_failed` | FluentValidation or Identity password rules |
| 423 | `account_locked` | Lockout active |

### Master data

| Status | `title` | When |
|--------|---------|------|
| 409 | `duplicate_id_no` | Customer NIK already exists |

### Users

| Status | `title` | When |
|--------|---------|------|
| 400 | `email_in_use` | Duplicate email on create/update |

### Documents (inbound, outbound, invoicing, inventory, AR)

Draft-only mutations throw `DomainException` → **400** with messages such as:

- `Only draft POs can be updated.`
- `GRN already posted.`
- `DO already posted.`

Posting with insufficient stock or credit limit violations also surface as **400** domain errors.

Concurrent updates to the same row may return **409 Concurrency conflict**.

---

## Client handling guidelines

1. Check `status` first, then `title` for programmatic branching.
2. Display `detail` to users (may be Bahasa Indonesia for auth messages).
3. On **401** from API client: attempt `POST /api/auth/refresh` once; on failure redirect to login.
4. On **409**: refresh the entity and retry or show conflict UI.
5. On **429**: exponential backoff; respect rate limits on login/refresh.

---

## Related

- [authentication.md](authentication.md) — auth-specific failures
- [authorization.md](authorization.md) — 403 causes
- [../security/security-review.md](../security/security-review.md) — security checklist
