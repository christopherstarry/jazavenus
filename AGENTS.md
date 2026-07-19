# Jaza Venus — Agent Guide

Modern web replacement for the legacy VB6 **Sales Inventory System**. Agent guidance routes you to project docs — it does not replace them.

## North star

1. Preserve daily business workflows and legacy screen labels.
2. Fix security, maintainability, and known pain points.
3. Cut over to production without losing data or business rules.

Full goals: [docs/project-goals.md](docs/project-goals.md).

## Doc authority (read in this order)

1. [docs/project-goals.md](docs/project-goals.md) — G1–G5 must-haves, I1–I8 improvements
2. [docs/brds/brd-parity-and-changes.md](docs/brds/brd-parity-and-changes.md) — non-negotiable parity rules (§2)
3. Feature PRD under `docs/modules/{module}/prds/`
4. [docs/parity/legacy-to-new-parity-matrix.md](docs/parity/legacy-to-new-parity-matrix.md) + [docs/README.md](docs/README.md) deployment section — live status truth
5. Sibling **Jaza Venus Legacy Program** (`../Jaza Venus Legacy Program/docs/`) — read-only when PRD/matrix is incomplete

Do not duplicate PRDs or the parity matrix into responses — link and cite rows.

## Stack and layout

| Layer | Path |
|-------|------|
| Domain / Application / Infrastructure / Api | `backend/src/Jaza.{Domain,Application,Infrastructure,Api}/` |
| ETL console | `backend/src/Jaza.Migration/` |
| Features (by module) | `frontend/src/features/{module}/` |
| Routes, sidebar, permissions (SSOT) | `frontend/src/app/modules.tsx` |
| API route map | [docs/http-api.md](docs/http-api.md) |
| Module docs index | [docs/modules/README.md](docs/modules/README.md) |

Repo overview: [README.md](README.md).

## Dev and test commands

See [setup.md](setup.md) and [docs/development.md](docs/development.md).

```powershell
docker compose -f deploy/docker-compose.dev.yml up -d
cd backend && dotnet ef database update --project src/Jaza.Infrastructure --startup-project src/Jaza.Api
dotnet run --project backend/src/Jaza.Api
npm --prefix frontend run dev
dotnet test backend
npm --prefix frontend test
```

Integration tests use Testcontainers — **Docker must be running**.

## Non-negotiable business rules

From [project-goals.md §5](docs/project-goals.md) and [brd-parity-and-changes.md §2](docs/brds/brd-parity-and-changes.md):

- **Document chain:** PO → GRN; SO → Delivery → Invoice → Payment
- **Discounts:** P1 product, P2 extra/customer, P3 free goods
- **Credit control:** plafond check at SO/Delivery/Invoice + admin override
- **Overdue blocking:** past-due invoices block + admin override
- **Stock:** Available = OnHand − Committed
- **Tax:** Faktur Pajak serial from TaxNo pool (PKP customers)
- **Payments:** Cash, Transfer, Check/Giro, Others, Return, Adjustment
- **Division scoping:** users see only their division data
- **Status enums:** legacy O/B/C (Open/Cancelled/Closed) in BRD; new app stores `Draft` / `Posted` / `Voided` — map correctly, do not mix

Reuse existing logic (`businessRuleFlow.ts`, Application credit/stock services) before inventing new rules.

## UI foundation (transaction and master screens)

Must reuse shared patterns — [docs/modules/shared/ui-foundation/](docs/modules/shared/ui-foundation/):

- `LegacyTransactionToolbar`, `EditableLineGrid`, `LookupDialog`, `LookupFieldInput`
- Confirm/toast dialogs — [dialog-patterns.md](docs/modules/shared/ui-foundation/dialog-patterns.md)
- `CrudPage` for simple master CRUD
- Reports — `LegacyReportPage` + [report-screen-pattern.md](docs/modules/reports/prds/report-screen-pattern.md)
- i18n: default locale **Indonesian (`id`)**; add keys to `frontend/src/i18n/locales/{id,en}/`

PRD writing guide (for humans): [docs/modules/shared/prd-guide.md](docs/modules/shared/prd-guide.md).

## Definition of done

Before marking a feature complete:

- [ ] PRD acceptance criteria met
- [ ] Backend entity + API + frontend wired (not shell-only) — see parity matrix status legend
- [ ] Business rules preserved for transaction features
- [ ] i18n strings added (en + id)
- [ ] Tests where patterns exist (xUnit for business rules; Vitest for shared UI)
- [ ] Parity matrix row updated with status and gap notes

Optional cross-checks: [docs/use-cases/overview.md](docs/use-cases/overview.md), [docs/modules/qa/phase-7-acceptance-checklist.md](docs/modules/qa/phase-7-acceptance-checklist.md).

## Skills (attach explicitly)

| Skill | When |
|-------|------|
| `implement-prd` | Implement or finish any screen/API from a PRD (scope: `full-stack`, `api-only`, or `ui-only`) |
| `transaction-screen` | SO/PO/GRN/Invoice/BPB/BBK/AR transaction UI with toolbar/grid/lookups |
| `add-api-endpoint` | New or incomplete REST surface without a full screen pass |
| `verify-parity` | UAT prep, “is this done?”, gap analysis |
| `consult-legacy` | Behavior unclear; PRD incomplete — search Legacy Program read-only |

Skills live in `.cursor/skills/`. Stack conventions auto-apply via `.cursor/rules/` when editing matching files.

## Legacy Program

Optional sibling workspace for VB6 behavior lookup. **Never edit** legacy source or docs unless explicitly asked. Use skill `consult-legacy`.

## Data migration and cutover pointers

- ETL: [docs/migration-howto.md](docs/migration-howto.md), [docs/schema-mapping.md](docs/schema-mapping.md)
- Go-live: [docs/cutover-checklist.md](docs/cutover-checklist.md)
- Security pre-go-live: [docs/security/security-review.md](docs/security/security-review.md) — never commit secrets

## Phase priority

Prefer **Phase 1 cutover blockers** (daily procure-to-cash, credit/overdue, stock commit, Faktur Pajak, top reports) over Phase 3 automation per [brd-parity-and-changes.md §5](docs/brds/brd-parity-and-changes.md).
