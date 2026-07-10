# API changelog

All notable HTTP API changes are documented here. The API follows the repository release cadence; OpenAPI is available at `/openapi/v1.json` in Development.

---

## 2026-07-10 — Initial API parity release

**Theme:** Full legacy REST surface for VB6 parity — 34 controllers, ~270 endpoints, dual-mode auth, module/report permissions, division scoping.

### Added — Authentication & users

- Dual-mode auth: HttpOnly cookie (`jaza.auth`) + JWT bearer + refresh rotation
- MFA enrolment (`/api/auth/mfa/init`, `/confirm`) with SuperAdmin production gate
- User preferences (`/api/auth/preferences`)
- User CRUD and permission management (`/api/users`, `/api/users/{id}/permissions`)
- Audit logs (`/api/audit-logs`) and developer error logs (`/api/error-logs`)

### Added — Master data & settings

- Core master data CRUD: units, categories, items, suppliers, customers (+ addresses, brand discounts), warehouses, locations
- Reference data CRUD (23 resources): brands, banks, salesmen, collectors, areas, outlet types/groups, trade types, tax registrations, price tiers, discount codes, payment terms, item prices/discounts, etc.
- Extra discounts (`/api/master/extra-discounts`)
- Company settings, fiscal periods, order/return codes (`/api/settings`)
- Lookup API (`/api/lookup/{type}`)
- Item import/export Excel (`/api/io/items.xlsx`)

### Added — Transactions

- **Purchase:** PO, GRN, purchase returns (`/api/inbound`)
- **Sales:** SO, DO, sales returns (`/api/outbound`)
- **Invoicing:** invoices (+ PDF, void, payments), credit memos (`/api/invoices`)
- **AR:** batch payments, adjustments, PDC clearance, period close (`/api/ar`)
- **Inventory:** stock receipts/issues/transfers, stock take, on-hand, adjustments (`/api/inventory`, `/api/stock`)

### Added — Reports & tooling

- Built-in reports: stock card, low stock, daily movements, financial summary
- Dynamic report executors: 40 sales + 25 inventory + 6 purchase + 23 AR report keys
- Pricing resolver (`/api/pricing/resolve`)
- Tax Faktur serials (`/api/tax/serials`)
- Process queue stubs (`/api/processes`) and system jobs (`/api/system`)
- Integration stubs: Semblog, Clipper, SMS orders (`/api/integrations`)

### Added — Documentation

- API doc suite under `docs/api/` (this release)
- Export script: `backend/scripts/export-api-docs.ps1`
- Generated artifacts: `docs/api/generated/routes.md`, `docs/api/endpoint-manifest.json`

### Security

- CSRF protection for cookie clients (`X-XSRF-TOKEN` / `jaza.xsrf`)
- Rate limiting: login 10/min/IP, refresh 30/min/user, global 240/min/IP
- RFC 7807 ProblemDetails for errors
- Division scoping via preferences and `X-Division` header

### Known gaps (post-release)

- Consignment, penetration, LHPP, class parameters — no REST equivalent yet
- Batch/integration endpoints are stubs (enqueue only)
- Most transaction UIs not yet wired to new endpoints

See [../parity/legacy-to-new-parity-matrix.md](../parity/legacy-to-new-parity-matrix.md) for feature-level status.

---

## Template for future entries

```markdown
## YYYY-MM-DD — Title

### Added
- …

### Changed
- …

### Deprecated
- …

### Removed
- …

### Fixed
- …

### Security
- …
```
