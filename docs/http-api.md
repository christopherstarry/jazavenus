# HTTP API reference — Jaza Venus

The browser SPA calls same-origin `/api`. In local dev, Vite proxies that to `https://localhost:5001`; on Vercel, `frontend/vercel.json` rewrites `/api/*` to `https://jaza-venus.fly.dev/api/*`.

**Documentation suite:** [api/README.md](api/README.md) · **Generated manifest:** [api/endpoint-manifest.json](api/endpoint-manifest.json) · **Regenerate:** `backend/scripts/export-api-docs.ps1`

**Controller count:** 34 API controllers (~202 action routes scanned; ReferenceData CRUD expands to ~270 logical endpoints).

**Default policy:** authenticated user required (cookie + JWT). Anonymous routes are explicit (`[AllowAnonymous]`).

**CSRF:** cookie clients send `X-XSRF-TOKEN` matching `jaza.xsrf` on mutating requests. Bearer clients skip CSRF.

**Discoverability (Development):**

- OpenAPI: **`/openapi/v1.json`**
- Scalar UI: `MapScalarApiReference()` when `ASPNETCORE_ENVIRONMENT=Development`
- Swagger UI: `/swagger`

---

## Roles and policies

| Policy | Roles |
|--------|-------|
| `RequireDeveloper` | Developer |
| `RequireSuperAdmin` | Developer, SuperAdmin |
| `RequireAdmin` | Developer, SuperAdmin, Admin |
| `RequireOperator` | Developer, SuperAdmin, Admin, Sales |

Module gates: `[RequireModule("master"|"purchase"|"sales"|"ar"|"inventory")]`. Report gates: `[RequireReport("sales"|"inventory"|"purchase"|"ar")]`.

Abbreviations in tables below: **Anon** = AllowAnonymous · **Auth** = any authenticated · **Op** = RequireOperator · **Adm** = RequireAdmin · **SA** = RequireSuperAdmin · **Dev** = RequireDeveloper · **Mod:X** = module permission · **Rpt:X** = report permission.

---

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Anon |

---

## 1. AuthController — `api/auth`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/login` | Anon | Rate limit `login` |
| POST | `/api/auth/logout` | Auth | |
| POST | `/api/auth/refresh` | Anon | Rate limit `refresh` |
| GET | `/api/auth/me` | Auth | |
| GET | `/api/auth/antiforgery` | Anon | |
| POST | `/api/auth/change-password` | SA | |
| POST | `/api/auth/me/change-password` | SA | |
| POST | `/api/auth/mfa/init` | Auth | |
| POST | `/api/auth/mfa/confirm` | Auth | |
| GET | `/api/auth/preferences` | Auth | |
| PUT | `/api/auth/preferences` | Auth | |

Module guide: [api/modules/auth.md](api/modules/auth.md)

---

## 2. UsersController — `api/users`

Class: **SA**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/users` | Paged list |
| GET | `/api/users/{id}` | |
| POST | `/api/users` | |
| PUT | `/api/users/{id}` | |
| DELETE | `/api/users/{id}` | |
| POST | `/api/users/{id}/reset-password` | |

---

## 3. PermissionsController — `api/users/{userId}/permissions`

Class: **SA**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/users/{userId}/permissions` | |
| PUT | `/api/users/{userId}/permissions` | Replace all |

Module guide: [api/modules/users.md](api/modules/users.md)

---

## 4. MasterDataController — `api/master`

Class: **Op + Mod:master**. Writes **Adm**; deletes **SA**.

| Method | Path | Write |
|--------|------|-------|
| GET/POST/PUT/DELETE | `/api/master/units`, `/units/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/categories`, `/categories/{id}` | Adm / SA |
| GET | `/api/master/items`, `/items/{id}` | — |
| POST/PUT/DELETE | `/api/master/items`, `/items/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/suppliers`, `/suppliers/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/customers`, `/customers/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/customers/{customerId}/addresses`, `…/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/customers/{customerId}/brand-discounts`, `…/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/warehouses`, `/warehouses/{id}` | Adm / SA |
| GET/POST/PUT/DELETE | `/api/master/locations`, `/locations/{id}` | Adm / SA |

---

## 5. ReferenceDataController — `api/master`

Class: **Op + Mod:master**. Each resource: GET list, POST, PUT `/{id}` (**Adm**), DELETE `/{id}` (**SA**).

Resources: `brands`, `banks`, `salesmen`, `collectors`, `areas`, `warehouse-types`, `outlet-types`, `outlet-groups`, `outlet-group-types`, `trade-types`, `sub-trade-types`, `distribution-types`, `class-outlets`, `cost-types`, `manufacturers`, `tax-registrations`, `price-tiers`, `discount-codes`, `payment-terms`, `sub-categories`, `customer-addresses`, `item-prices` (+ GET `/{id}`), `item-discounts` (+ GET `/{id}`).

---

## 6. ExtraDiscountsController — `api/master/extra-discounts`

Class: **Op + Mod:master**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/master/extra-discounts`, `/{id}` | — |
| POST/PUT/DELETE | `/api/master/extra-discounts`, `/{id}` | Adm |

Module guide: [api/modules/master-data.md](api/modules/master-data.md)

---

## 7. InboundController — `api/inbound`

Class: **Op + Mod:purchase**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/inbound/purchase-orders`, `/purchase-orders/{id}` | — |
| POST/PUT | `/api/inbound/purchase-orders`, `/purchase-orders/{id}` | Adm |
| POST | `/api/inbound/purchase-orders/{id}/post` | Adm |
| GET | `/api/inbound/grns`, `/grns/{id}` | — |
| POST/PUT | `/api/inbound/grns`, `/grns/{id}` | Op |
| POST | `/api/inbound/grns/{id}/post` | Op |

---

## 8. PurchaseReturnsController — `api/inbound/purchase-returns`

Class: **Op + Mod:purchase**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/inbound/purchase-returns`, `/{id}` | — |
| POST/PUT | `/api/inbound/purchase-returns`, `/{id}` | Op |
| POST | `/api/inbound/purchase-returns/{id}/post` | Adm |

Module guide: [api/modules/inbound.md](api/modules/inbound.md)

---

## 9. OutboundController — `api/outbound`

Class: **Op + Mod:sales**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/outbound/sales-orders`, `/sales-orders/{id}` | — |
| POST/PUT | `/api/outbound/sales-orders`, `/sales-orders/{id}` | Op |
| POST | `/api/outbound/sales-orders/{id}/post` | Adm |
| GET | `/api/outbound/delivery-orders`, `/delivery-orders/{id}` | — |
| POST/PUT | `/api/outbound/delivery-orders`, `/delivery-orders/{id}` | Op |
| POST | `/api/outbound/delivery-orders/{id}/post` | Op |

---

## 10. SalesReturnsController — `api/outbound/sales-returns`

Class: **Op + Mod:sales**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/outbound/sales-returns`, `/{id}` | — |
| POST/PUT | `/api/outbound/sales-returns`, `/{id}` | Op |
| POST | `/api/outbound/sales-returns/{id}/post` | Adm |

Module guide: [api/modules/outbound.md](api/modules/outbound.md)

---

## 11. InvoicingController — `api/invoices`

Class: **Op + Mod:ar**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/invoices`, `/{id}` | — |
| POST/PUT | `/api/invoices`, `/{id}` | Op |
| POST | `/api/invoices/{id}/post` | Adm |
| POST | `/api/invoices/{id}/void` | SA |
| GET | `/api/invoices/{id}/pdf` | Op |
| POST | `/api/invoices/{id}/payments` | Op |

---

## 12. CreditMemosController — `api/invoices/credit-memos`

Class: **Op + Mod:ar**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/invoices/credit-memos`, `/{id}` | — |
| POST/PUT | `/api/invoices/credit-memos`, `/{id}` | Op |
| POST | `/api/invoices/credit-memos/{id}/post` | Adm |

Module guide: [api/modules/invoicing.md](api/modules/invoicing.md)

---

## 13. ArPaymentsController — `api/ar/payments`

Class: **Op + Mod:ar**

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/ar/payments` | Batch payment + allocations |

---

## 14. ArAdjustmentsController — `api/ar/adjustments`

Class: **Op + Mod:ar**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/ar/adjustments`, `/{id}` | — |
| POST/PUT | `/api/ar/adjustments`, `/{id}` | Op |
| POST | `/api/ar/adjustments/{id}/post` | Adm |
| DELETE | `/api/ar/adjustments/{id}` | Adm |

---

## 15. ArClosingController — `api/ar`

Class: **Op + Mod:ar**

| Method | Path | Write |
|--------|------|-------|
| POST | `/api/ar/close-period` | Adm |
| POST | `/api/ar/recalculate-balance` | Adm |

---

## 16. PdcController — `api/ar/pdc`

Class: **Op + Mod:ar**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/ar/pdc`, `/{id}` | — |
| POST/PUT | `/api/ar/pdc`, `/{id}` | Op |
| DELETE | `/api/ar/pdc/{id}` | Adm |
| POST | `/api/ar/pdc/{id}/clear` | Adm |
| POST | `/api/ar/pdc/{id}/cancel-clearance` | Adm |

Module guide: [api/modules/ar.md](api/modules/ar.md)

---

## 17. StockController — `api/stock`

Class: **Op + Mod:inventory**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/stock/on-hand` | — |
| POST | `/api/stock/adjustments` | Adm |

---

## 18. InventoryDocumentsController — `api/inventory`

Class: **Op + Mod:inventory**

| Resource | GET | POST | PUT | POST post |
|----------|-----|------|-----|-----------|
| `stock-receipts` | list, `{id}` | create | draft | Adm |
| `stock-issues` | list, `{id}` | create | draft | Adm |
| `stock-transfers` | list, `{id}` | create | draft | Adm |

---

## 19. StockTakeController — `api/inventory/stock-takes`

Class: **Op + Mod:inventory**

| Method | Path | Write |
|--------|------|-------|
| GET | `/api/inventory/stock-takes`, `/{id}` | — |
| POST | `/api/inventory/stock-takes/prep` | Op |
| PUT | `/api/inventory/stock-takes/{id}/lines` | Op |
| POST | `/api/inventory/stock-takes/{id}/post` | Adm |

Module guide: [api/modules/inventory.md](api/modules/inventory.md)

---

## 20. SettingsController — `api/settings`

Class: **Op + Mod:master**. Mutations **Adm**.

| Resource | CRUD paths |
|----------|------------|
| `company` | GET, PUT |
| `fiscal-periods` | GET, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |
| `order-codes` | GET, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |
| `return-codes` | GET, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |

Module guide: [api/modules/settings.md](api/modules/settings.md)

---

## 21. TaxSerialsController — `api/tax/serials`

Class: **Op + Mod:sales**. Writes **Adm**.

| Method | Path |
|--------|------|
| GET/POST/PUT/DELETE | `/api/tax/serials`, `/{id}` |

Module guide: [api/modules/tax.md](api/modules/tax.md)

---

## 22. PricingController — `api/pricing`

Class: **Op + Mod:sales**

| Method | Path |
|--------|------|
| GET | `/api/pricing/resolve` |

---

## 23. LookupController — `api/lookup`

Class: **Op + Mod:master**

| Method | Path |
|--------|------|
| GET | `/api/lookup/types` |
| GET | `/api/lookup/{type}` |

Module guide: [api/modules/lookup.md](api/modules/lookup.md)

---

## 24. ReportsController — `api/reports`

Class: **Op**

| Method | Path | Extra |
|--------|------|-------|
| GET | `/api/reports/stock-card` | Rpt:inventory |
| GET | `/api/reports/low-stock` | Rpt:inventory |
| GET | `/api/reports/daily-movements` | Rpt:inventory |
| GET | `/api/reports/financial-summary` | SA + Rpt:ar |

---

## 25–28. Domain report controllers

Class: **Op + Rpt:{domain}**

| Controller | Path | Keys |
|------------|------|------|
| SalesReportsController | `GET /api/reports/sales/{reportKey}` | 40 keys — e.g. `register-book`, `sales-by-customer` |
| InventoryReportsController | `GET /api/reports/inventory/{reportKey}` | 25 keys — e.g. `stock-card`, `bpb-report` |
| PurchaseReportsController | `GET /api/reports/purchase/{reportKey}` | 6 keys — e.g. `purchase-report` |
| ArReportsController | `GET /api/reports/ar/{reportKey}` | 23 keys — e.g. `aging`, `payment-register` |

Full key list: `Jaza.Infrastructure.Reports.ReportCatalog`.

Module guide: [api/modules/reports.md](api/modules/reports.md)

---

## 29. ImportExportController — `api/io`

Class: **Adm + Mod:master**

| Method | Path |
|--------|------|
| GET | `/api/io/items.xlsx` |
| POST | `/api/io/items.xlsx` |

---

## 30. IntegrationsController — `api/integrations`

Class: **Op + Mod:master**. POST **Adm**.

| Method | Path |
|--------|------|
| POST | `/api/integrations/semblog` |
| POST | `/api/integrations/clipper` |
| POST | `/api/integrations/sms-orders` |

---

## 31. ProcessesController — `api/processes`

Class: **Op + Mod:sales**. Enqueue **Adm**.

| Method | Path |
|--------|------|
| GET | `/api/processes` |
| POST | `/api/processes/auto-delivery` |
| POST | `/api/processes/auto-invoice` |
| POST | `/api/processes/auto-delete` |
| POST | `/api/processes/auto-po-from-so` |

Module guide: [api/modules/integrations.md](api/modules/integrations.md)

---

## 32. SystemController — `api/system`

Class: **Op + Mod:master**. POST mostly **Adm**; backup/restore **SA**.

| Method | Path |
|--------|------|
| POST | `/api/system/monthly-process` |
| POST | `/api/system/day-end` |
| POST | `/api/system/delete-cancelled-document` |
| POST | `/api/system/backup` |
| POST | `/api/system/restore` |

Module guide: [api/modules/system.md](api/modules/system.md)

---

## 33. AuditLogsController — `api/audit-logs`

Class: **SA**

| Method | Path |
|--------|------|
| GET | `/api/audit-logs` |
| GET | `/api/audit-logs/{id}` |

---

## 34. ErrorLogsController — `api/error-logs`

Class: **Dev**

| Method | Path |
|--------|------|
| GET | `/api/error-logs` |
| GET | `/api/error-logs/{id}` |

Module guide: [api/modules/audit.md](api/modules/audit.md)

---

## Maintenance

This document is maintained alongside controller source. When in doubt:

1. Run `backend/scripts/export-api-docs.ps1` for machine-readable routes
2. Trust OpenAPI `/openapi/v1.json` in Development
3. See module guides under [api/modules/](api/modules/) for curl examples

Last parity release: **2026-07-10** — see [api/changelog.md](api/changelog.md).
