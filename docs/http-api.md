# HTTP API reference — Jaza Venus

All routes are under the same origin as the API unless CORS is configured for separate dev origins (typically `localhost:5173` for Vite).

**Default policy**: authenticated user required. Anonymous access is explicit via `[AllowAnonymous]` (e.g. `POST /api/auth/login`, `GET /api/auth/antiforgery`).

**CSRF**: state-changing endpoints use `[AutoValidateAntiforgeryToken]` at controller level (`Program.cs`). Send `X-XSRF-TOKEN` matching the antiforgery cookie after obtaining a token (`GET /api/auth/antiforgery`).

**Discoverability (Development only)**:

- OpenAPI document: **`/openapi/v1.json`**
- **Scalar UI**: enabled via `MapScalarApiReference()` when `Environment.IsDevelopment()` — use the Scalar endpoint shown for your ASP.NET Scalar version (often under `/scalar/...` on the API origin).

Production does not expose Swagger/Scalar publicly by default.

## Roles and policies

| Policy | Roles allowed |
|--------|----------------|
| `RequireSuperAdmin` | SuperAdmin |
| `RequireAdmin` | SuperAdmin, Admin |
| `RequireOperator` | SuperAdmin, Admin, Operator |

Controller-level defaults apply unless a method overrides with `[Authorize(Policy = ...)]`.

## Auth — `api/auth`

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/login` | Anonymous | Rate limited (`login` policy). |
| POST | `/api/auth/logout` | Yes | |
| GET | `/api/auth/me` | Yes | Current user profile. |
| GET | `/api/auth/antiforgery` | Anonymous | Issues antiforgery cookie + header. |
| POST | `/api/auth/change-password` | Yes | |
| POST | `/api/auth/mfa/init` | Yes | |
| POST | `/api/auth/mfa/confirm` | Yes | |

## Master data — `api/master`

Class default: **`RequireOperator`**. Writes often **`RequireAdmin`** (units, categories, items, suppliers, customers, warehouses, locations).

Representative endpoints:

| Method | Path | Typical policy |
|--------|------|------------------|
| GET | `/api/master/units`, `categories`, `items`, `suppliers`, `customers`, `warehouses`, `locations` | Operator+ |
| GET | `/api/master/items/{id}` | Operator+ |
| POST/PUT/DELETE | `units`, `categories`, `items`, … | Admin+ |

See `MasterDataController.cs` for exact combinations (some item writes are Admin-only).

## Inbound — `api/inbound`

Default: **`RequireOperator`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/inbound/purchase-orders` | List |
| GET | `/api/inbound/purchase-orders/{id}` | Detail |
| POST | `/api/inbound/purchase-orders` | Create |
| POST | `/api/inbound/purchase-orders/{id}/post` | **Admin+** |
| GET | `/api/inbound/grns` | |
| GET | `/api/inbound/grns/{id}` | |
| POST | `/api/inbound/grns` | |
| POST | `/api/inbound/grns/{id}/post` | **Admin+** |

## Outbound — `api/outbound`

Default: **`RequireOperator`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/outbound/sales-orders` | |
| GET | `/api/outbound/sales-orders/{id}` | |
| POST | `/api/outbound/sales-orders` | |
| POST | `/api/outbound/sales-orders/{id}/post` | **Admin+** |
| GET | `/api/outbound/delivery-orders` | |
| GET | `/api/outbound/delivery-orders/{id}` | |
| POST | `/api/outbound/delivery-orders` | |
| POST | `/api/outbound/delivery-orders/{id}/post` | |

## Stock — `api/stock`

Default: **`RequireOperator`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/stock/on-hand` | |
| POST | `/api/stock/adjustments` | **Admin+** |

## Invoicing — `api/invoices`

Default: **`RequireOperator`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/invoices` | |
| GET | `/api/invoices/{id}` | |
| POST | `/api/invoices` | |
| POST | `/api/invoices/{id}/post` | **Admin+** |
| POST | `/api/invoices/{id}/void` | **SuperAdmin** |
| GET | `/api/invoices/{id}/pdf` | |
| POST | `/api/invoices/{id}/payments` | |

## Reports — `api/reports`

Default: **`RequireOperator`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/reports/stock-card` | Query params per controller |
| GET | `/api/reports/low-stock` | |
| GET | `/api/reports/daily-movements` | |
| GET | `/api/reports/financial-summary` | **SuperAdmin** |

## Import / export — `api/io`

Controller default: **`RequireAdmin`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/io/items.xlsx` | Export |
| POST | `/api/io/items.xlsx` | Import |

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Anonymous (Kubernetes-style probe) |

This document is manually maintained — when in doubt, trust the controller source and OpenAPI JSON in Development.
