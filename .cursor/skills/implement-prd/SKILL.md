---
name: implement-prd
description: Implements Jaza Venus features from module PRDs — backend, frontend, or full-stack. Use when building or finishing any screen/API from docs/modules/*/prds/, wiring UI to API, or closing parity gaps.
disable-model-invocation: true
---

# Implement from PRD

Primary workflow for feature work in Jaza Venus. Stack conventions auto-apply via `.cursor/rules/` when editing files.

## Step 0: Choose scope

Ask or infer from the request:

| Scope | Build |
|-------|-------|
| `full-stack` | Domain/Application/Infrastructure + Api + frontend feature + modules.tsx |
| `api-only` | Backend layers only; skip frontend unless PRD requires DTO shapes for future UI |
| `ui-only` | Frontend feature wiring to existing API; skip backend unless gaps found |

For REST-only work without a screen, prefer skill `add-api-endpoint`. For transaction UI patterns, also read skill `transaction-screen`.

## Step 1: Read docs

1. PRD: `docs/modules/{module}/prds/{feature}.md`
2. Flow: `docs/modules/{module}/flow/overview.md` (when present)
3. API: `docs/api/modules/` — use alias map (sales→`outbound.md`, purchase→`inbound.md`, invoices→`invoicing.md`; see rule `jaza-docs-and-parity`)
4. Parity row: `docs/parity/legacy-to-new-parity-matrix.md`
5. UI foundation (if screen): `docs/modules/shared/ui-foundation/` (+ reports → `docs/modules/reports/prds/report-screen-pattern.md`)

Find a **reference implementation** in the same module (e.g. `PurchaseOrderPage.tsx`, matching controller).

## Step 2: Backend (`api-only` or `full-stack`)

Follow [setup.md](../../../setup.md) entity recipe:

1. Entity in `Jaza.Domain/{Area}/`
2. `DbSet` + config in `AppDbContext` (respect [naming-conventions.md](../../../docs/database/naming-conventions.md))
3. EF migration if schema changes
4. DTOs + FluentValidation in `Jaza.Application/{Module}/`
5. Service interface + Infrastructure implementation if non-trivial
6. Controller actions with auth, division scope, audit on writes
7. xUnit test for business rules in `Jaza.Application.Tests/`

## Step 3: Frontend (`ui-only` or `full-stack`)

1. Feature folder: `frontend/src/features/{module}/`
2. Register in `frontend/src/app/modules.tsx` (route, label, permissions)
3. i18n keys in `locales/id/` and `locales/en/`
4. Reuse `CrudPage` or transaction components per PRD
5. Vitest for non-trivial shared UI logic

## Step 4: Verify and document

- [ ] PRD acceptance criteria checked off
- [ ] Business rules preserved ([project-goals.md §5](../../../docs/project-goals.md))
- [ ] Parity matrix row updated (status + gap notes)
- [ ] `dotnet test` and/or `npm test` pass for touched areas

## Entity recipe quick reference

```powershell
dotnet ef migrations add FeatureName --project src/Jaza.Infrastructure --startup-project src/Jaza.Api
dotnet test backend
npm --prefix frontend test
```

## Don't

- Skip `modules.tsx` registration
- Hardcode English-only UI strings
- Mark Implemented in parity matrix when UI is not API-connected
