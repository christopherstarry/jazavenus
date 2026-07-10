# API testing strategy

This document defines how Jaza Venus validates the REST API introduced in the 2026-07-10 parity release. Target: **≥ 85% line coverage** on `Jaza.Api` controllers and **100% happy-path coverage** on critical financial documents.

---

## Test layers

| Layer | Project | Scope |
|-------|---------|-------|
| Unit | `Jaza.Application.Tests` | Validators, services, permission resolver, document rules |
| Integration | `Jaza.Api.IntegrationTests` | HTTP endpoints against Testcontainers PostgreSQL |
| Contract | OpenAPI + `endpoint-manifest.json` | Route drift detection via export script |

Run locally:

```bash
cd backend
dotnet test --collect:"XPlat Code Coverage"
```

Coverage gate (CI): fail if `Jaza.Api` + `Jaza.Application` combined line coverage drops below **85%**.

---

## Endpoint matrix

Each controller row tracks integration test status. Legend: ✅ Covered · 🔶 Partial · ⬜ Planned

### Auth & administration

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| AuthController | `/api/auth` | login, refresh, me, MFA, preferences | ✅ |
| UsersController | `/api/users` | CRUD, reset-password | ✅ |
| PermissionsController | `/api/users/{id}/permissions` | GET/PUT replace | ✅ |
| AuditLogsController | `/api/audit-logs` | paged search | 🔶 |
| ErrorLogsController | `/api/error-logs` | Developer-only GET | 🔶 |

### Master data

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| MasterDataController | `/api/master` | items, customers, suppliers CRUD | ✅ |
| ReferenceDataController | `/api/master` | brands, banks, payment-terms | 🔶 |
| ExtraDiscountsController | `/api/master/extra-discounts` | CRUD + post conflict | 🔶 |
| LookupController | `/api/lookup` | types + search | ⬜ |
| ImportExportController | `/api/io` | xlsx round-trip | ⬜ |

### Purchase & sales

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| InboundController | `/api/inbound` | PO create → post, GRN post | ✅ |
| PurchaseReturnsController | `/api/inbound/purchase-returns` | create → post | 🔶 |
| OutboundController | `/api/outbound` | SO → DO post chain | ✅ |
| SalesReturnsController | `/api/outbound/sales-returns` | create → post, 409 paths | 🔶 |

### Invoicing & AR

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| InvoicingController | `/api/invoices` | create → post → payment | ✅ |
| CreditMemosController | `/api/invoices/credit-memos` | create → post | 🔶 |
| ArPaymentsController | `/api/ar/payments` | batch allocation | ✅ |
| ArAdjustmentsController | `/api/ar/adjustments` | draft lifecycle | 🔶 |
| ArClosingController | `/api/ar` | close-period | ⬜ |
| PdcController | `/api/ar/pdc` | create → clear | 🔶 |

### Inventory

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| StockController | `/api/stock` | on-hand, adjustment | ✅ |
| InventoryDocumentsController | `/api/inventory` | receipt/issue/transfer post | 🔶 |
| StockTakeController | `/api/inventory/stock-takes` | prep → post | ⬜ |

### Settings, tax, pricing

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| SettingsController | `/api/settings` | company, fiscal periods | 🔶 |
| TaxSerialsController | `/api/tax/serials` | allocate on invoice post | 🔶 |
| PricingController | `/api/pricing` | resolve | ⬜ |

### Reports

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| ReportsController | `/api/reports` | stock-card, low-stock | 🔶 |
| SalesReportsController | `/api/reports/sales` | sample reportKey | ⬜ |
| InventoryReportsController | `/api/reports/inventory` | stock-card key | ⬜ |
| PurchaseReportsController | `/api/reports/purchase` | purchase-report key | ⬜ |
| ArReportsController | `/api/reports/ar` | aging key | ⬜ |

### System & integrations

| Controller | Prefix | Critical paths | Status |
|------------|--------|----------------|--------|
| ProcessesController | `/api/processes` | enqueue stubs | ⬜ |
| IntegrationsController | `/api/integrations` | stub 200 | ⬜ |
| SystemController | `/api/system` | auth gate SuperAdmin | ⬜ |

**Total controllers:** 34 · **Critical-path covered:** ~18 ✅ · **Target by GA:** all ✅

---

## Coverage breakdown (85% target)

| Assembly | Target | Focus areas |
|----------|--------|-------------|
| `Jaza.Api` | 80%+ | Controller auth attributes, ProblemDetails, division header |
| `Jaza.Application` | 90%+ | Validators, posting services, stock commit, AR allocation |
| `Jaza.Infrastructure` | 75%+ | Report query SQL, permission DB reads |
| Combined gate | **85%** | interrupting CI |

Exclude from coverage gate: OpenAPI filters, Program.cs bootstrap, migration snapshots.

---

## Test scenarios per document type

Every transactional controller must have tests for:

1. **Happy path** — create draft → post → verify side effects (stock, AR balance)
2. **Draft guard** — update/post on non-draft returns 400
3. **Auth gate** — anonymous 401, wrong module 403, Sales cannot Admin write
4. **Division** — cross-division read forbidden; write requires header
5. **Conflict** — duplicate master key 409 or concurrency 409 where applicable

---

## Fixture strategy

Integration tests use:

- `WebApplicationFactory<Program>` with test configuration
- Seeded SuperAdmin + Sales users (`DbInitializer`)
- Deterministic GUIDs for supplier, customer, item, warehouse per division
- `FakeClock` for fiscal period boundaries (where injected)

---

## Regression checklist (pre-release)

- [ ] `dotnet test backend` green
- [ ] Combined coverage ≥ 85%
- [ ] `backend/scripts/export-api-docs.ps1` — manifest matches controllers
- [ ] OpenAPI `/openapi/v1.json` diff reviewed
- [ ] Manual smoke: login → PO → GRN → SO → DO → Invoice → Payment
- [ ] CSRF: cookie client blocked without `X-XSRF-TOKEN`
- [ ] Bearer client: mutating request succeeds without CSRF

---

## Related

- [../development.md](../development.md) — local test commands
- [testing-strategy.md endpoint manifest](endpoint-manifest.json) — machine-readable route list
- [modules/](modules/) — per-module curl examples
