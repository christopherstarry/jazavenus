# Jaza Venus HTTP API — documentation index

The Jaza Venus backend exposes a REST API under `/api`. The browser SPA calls same-origin `/api`; local dev proxies to `https://localhost:5001` via Vite.

**OpenAPI (Development):** [`/openapi/v1.json`](https://localhost:5001/openapi/v1.json) · **Scalar UI:** enabled when `ASPNETCORE_ENVIRONMENT=Development`

**Generated artifacts:** run [`backend/scripts/export-api-docs.ps1`](../../backend/scripts/export-api-docs.ps1) to refresh [`generated/routes.md`](generated/routes.md) and [`endpoint-manifest.json`](endpoint-manifest.json).

---

## Quick links

| Topic | Document |
|-------|----------|
| Authentication & sessions | [authentication.md](authentication.md) |
| Roles, modules, reports | [authorization.md](authorization.md) |
| Errors & status codes | [errors.md](errors.md) |
| Paging, division, documents | [conventions.md](conventions.md) |
| VB6 → REST mapping | [legacy-endpoint-map.md](legacy-endpoint-map.md) |
| Test matrix & coverage | [testing-strategy.md](testing-strategy.md) |
| Release notes | [changelog.md](changelog.md) |
| Full route table (all controllers) | [../http-api.md](../http-api.md) |

---

## Module guides

| Module | Guide | Base route |
|--------|-------|------------|
| Auth | [modules/auth.md](modules/auth.md) | `/api/auth` |
| Users & permissions | [modules/users.md](modules/users.md) | `/api/users` |
| Master data | [modules/master-data.md](modules/master-data.md) | `/api/master` |
| Purchase / inbound | [modules/inbound.md](modules/inbound.md) | `/api/inbound` |
| Sales / outbound | [modules/outbound.md](modules/outbound.md) | `/api/outbound` |
| Invoicing | [modules/invoicing.md](modules/invoicing.md) | `/api/invoices` |
| Accounts receivable | [modules/ar.md](modules/ar.md) | `/api/ar` |
| Inventory | [modules/inventory.md](modules/inventory.md) | `/api/inventory`, `/api/stock` |
| Settings | [modules/settings.md](modules/settings.md) | `/api/settings` |
| Tax serials | [modules/tax.md](modules/tax.md) | `/api/tax/serials` |
| Reports | [modules/reports.md](modules/reports.md) | `/api/reports` |
| Integrations & I/O | [modules/integrations.md](modules/integrations.md) | `/api/integrations`, `/api/io`, `/api/processes` |
| Audit & error logs | [modules/audit.md](modules/audit.md) | `/api/audit-logs`, `/api/error-logs` |
| Lookup & pricing | [modules/lookup.md](modules/lookup.md) | `/api/lookup`, `/api/pricing` |
| System jobs | [modules/system.md](modules/system.md) | `/api/system` |

---

## Authentication overview

The API supports **dual-mode authentication**:

| Client | Mechanism | Mutating requests |
|--------|-----------|-------------------|
| Browser SPA | HttpOnly cookie `jaza.auth` | Also send `X-XSRF-TOKEN` header (from `jaza.xsrf` cookie) |
| Mobile / external | `Authorization: Bearer <jwt>` | No CSRF header required |

Obtain a session via `POST /api/auth/login`. The response includes a 15-minute JWT access token, a 24-hour refresh token, and sets the session cookie. See [authentication.md](authentication.md).

Anonymous endpoints are explicit (`[AllowAnonymous]`): login, refresh, antiforgery bootstrap, and `GET /health`.

---

## CSRF (browser clients)

State-changing requests from cookie-authenticated browsers must include the antiforgery token:

1. Call `GET /api/auth/antiforgery` (or login — both issue the cookie).
2. Read the `jaza.xsrf` cookie value.
3. Send it as header `X-XSRF-TOKEN` on every `POST`, `PUT`, `PATCH`, `DELETE`.

JWT bearer clients skip CSRF (`BearerSafeAntiforgeryFilter`). See [authentication.md](authentication.md#csrf).

---

## Division scoping

Transaction documents and many list endpoints are scoped to a **division** (legacy `CompanyIDKu`):

| Caller | Behaviour |
|--------|-----------|
| Sales / Admin | Filtered to division in user preferences (default `DISTRIBUTIONBDG`) |
| Developer / SuperAdmin | All divisions unless `X-Division` header pins one |
| Writes as admin | `X-Division` header **required** when no division is pinned |

Valid division codes: `DISTRIBUTIONBDG`, `DISTRIBUTIONCRB`, `TRADINGBDG`, `TRADINGCRB`.

See [conventions.md](conventions.md#division-scoping).

---

## Pagination

List endpoints accept query parameters:

| Parameter | Default | Max | Notes |
|-----------|---------|-----|-------|
| `page` | 1 | — | 1-based |
| `pageSize` | 20 | 50 | Hard cap via `PagedRequest.Normalized()` |
| `search` | — | — | Where supported |
| `sort` | — | — | Where supported |

Response envelope: `PagedResult<T>` → `{ items, totalCount, page, pageSize, totalPages }`.

Report endpoints use `page` / `pageSize` (max 500) via `ReportQueryParams`. See [conventions.md](conventions.md#pagination).

---

## Default authorization

Unless overridden, endpoints require an authenticated user. Layered checks:

1. **Role policy** — `RequireOperator` (any active user), `RequireAdmin`, `RequireSuperAdmin`, `RequireDeveloper`
2. **Module permission** — `[RequireModule("master"|"purchase"|"sales"|"ar"|"inventory")]`
3. **Report permission** — `[RequireReport("sales"|"inventory"|"purchase"|"ar")]`

See [authorization.md](authorization.md).

---

## Related docs

- Human-friendly auth flows: [../flow/auth/](../flow/auth/)
- Security review: [../security/security-review.md](../security/security-review.md)
- Legacy parity matrix: [../parity/legacy-to-new-parity-matrix.md](../parity/legacy-to-new-parity-matrix.md)
