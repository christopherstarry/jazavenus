# Jaza Venus â€” documentation index

## Deployment readiness & parity

| Document | Purpose |
|----------|---------|
| [parity/legacy-to-new-parity-matrix.md](parity/legacy-to-new-parity-matrix.md) | **Feature-by-feature status** â€” Implemented / Partial / Missing / Dropped |
| [brds/brd-parity-and-changes.md](brds/brd-parity-and-changes.md) | Legacy scope vs new app; phased delivery plan |
| [database/database-review.md](database/database-review.md) | **DB verdict** â€” schema parity status; application gaps |
| [database/implementation-status.md](database/implementation-status.md) | Table implementation tracker |
| [database/table-catalog.md](database/table-catalog.md) | Column-level catalog from EF model |
| [database/naming-conventions.md](database/naming-conventions.md) | Legacy â†’ canonical â†’ EF naming map |
| [database/audit-and-history.md](database/audit-and-history.md) | Activity history schema and queries |
| [database/migrations-changelog.md](database/migrations-changelog.md) | EF migration log |
| [security/security-review.md](security/security-review.md) | Security audit findings and pre-go-live checklist |
| [performance/performance-guide.md](performance/performance-guide.md) | Indexing, pagination, EF hygiene, Neon pooling |
| [cutover-checklist.md](cutover-checklist.md) | Go-live checklist |

**Current status:** Core backend skeleton (PO â†’ GRN â†’ SO â†’ DO â†’ Invoice â†’ Payment) exists. Activity History now covers transactions (audit enhanced). Phase 2 parity **tables** migrated in EF; APIs still to wire. Most transaction UIs and reports are not API-wired.

---

## Architecture & design

| Document | Purpose |
|----------|---------|
| [architecture.md](architecture.md) | System shape: layers, hosting, auth, SPA delivery |
| [architecture/diagrams.md](architecture/diagrams.md) | C4 context/container, domain map, deployment diagrams |
| [database/database-base-docs.md](database/database-base-docs.md) | Target PostgreSQL schema design |
| [database/erd.md](database/erd.md) | Consolidated entity relationship diagram |
| [database/implementation-status.md](database/implementation-status.md) | EF table implementation tracker |
| [offline-architecture.md](offline-architecture.md) | Future offline design |

---

## Business requirements (BRD)

| Document | Purpose |
|----------|---------|
| [brds/brd-non-technical.md](brds/brd-non-technical.md) | Non-technical overview |
| [brds/brd-client-bahasa.md](brds/brd-client-bahasa.md) | Client-facing (Bahasa) |
| [brds/brd-parity-and-changes.md](brds/brd-parity-and-changes.md) | Parity reconciliation and intended changes |

---

## Product requirements (PRD)

See **[modules/README.md](modules/README.md)** for the full module index.

| Area | Location |
|------|----------|
| Guide | [modules/shared/prd-guide.md](modules/shared/prd-guide.md) |
| **UI foundation** | [modules/shared/ui-foundation/](modules/shared/ui-foundation/) â€” lookup, toolbar, grid, dialogs |
| **Localization** | [modules/shared/localization/i18n-framework.md](modules/shared/localization/i18n-framework.md) |
| Auth | [modules/auth/prds/](modules/auth/prds/) |
| Master data | [modules/master-data/prds/](modules/master-data/prds/) |
| Sales transactions | [modules/sales/prds/](modules/sales/prds/) |
| Purchase | [modules/purchase/prds/](modules/purchase/prds/) |
| Inventory | [modules/inventory/prds/](modules/inventory/prds/) |
| A/R | [modules/ar/prds/](modules/ar/prds/) |
| **System utilities** | [modules/system/prds/](modules/system/prds/) â€” preferences, period-end, backup |
| Reports | [modules/reports/prds/report-catalog.md](modules/reports/prds/report-catalog.md) â€” links to pattern + domain catalogs |

---

## Process flows

| Area | Document |
|------|----------|
| Auth | [modules/auth/flow/](modules/auth/flow/) |
| Sales | [modules/sales/flow/overview.md](modules/sales/flow/overview.md) |
| Purchase | [modules/purchase/flow/overview.md](modules/purchase/flow/overview.md) |
| Inventory | [modules/inventory/flow/overview.md](modules/inventory/flow/overview.md) |
| A/R | [modules/ar/flow/overview.md](modules/ar/flow/overview.md) |

---

## Use cases

| Document | Purpose |
|----------|---------|
| [use-cases/overview.md](use-cases/overview.md) | Actor/role use cases aligned to permission model |

---

## Development & API

| Document | Purpose |
|----------|---------|
| [api/README.md](api/README.md) | **API documentation suite** â€” auth, authorization, modules, legacy map |
| [development.md](development.md) | Local setup, tests, publishing frontend into API |
| [http-api.md](http-api.md) | Full HTTP route map â€” 34 controllers, links to [api/modules/](api/modules/) |
| [security.md](security.md) | Threat model, OWASP mapping, headers, MFA |
| [security-performance-guide.md](security-performance-guide.md) | Combined security + performance notes |
| [runbook.md](runbook.md) | Production deploy, backup/restore, rollback |
| [deployment-hosting.md](deployment-hosting.md) | Hosting options |
| [deploy/fly-runbook.md](deploy/fly-runbook.md) | Fly.io deployment |

---

## Migration & data

| Document | Purpose |
|----------|---------|
| [discovery-checklist.md](discovery-checklist.md) | Phase 0: capture behaviour from legacy VB app |
| [schema-mapping.md](schema-mapping.md) | Legacy SQL Server â†’ new EF schema (ETL template) |
| [migration-howto.md](migration-howto.md) | Running `Jaza.Migration` ETL console |
| [legacy-schema-extract.sql](legacy-schema-extract.sql) | Legacy schema extract script |
| [seed-reference-data.sql](seed-reference-data.sql) | Reference data seed |

---

## Training

| Document | Purpose |
|----------|---------|
| [training-signoff.md](training-signoff.md) | Training and sign-off template |

---

The repository root [README.md](../README.md) has a concise overview and quick start.

**Legacy reference:** The VB6 source and docs live in `Jaza Venus Legacy Program/docs/`.
