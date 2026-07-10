# Phase 7 — UI Parity Acceptance Checklist

Cross-cutting QA pass for Phases 0–6 (gap screens only). Checked against domain PRDs under `docs/modules/*/prds/`.  
**Legend:** ✅ implemented & verified in code/build | ⚠️ partial / deferred | ❌ not implemented

Last run: 2026-07-10

---

## Phase 0 — Shared foundation

| Criterion | PRD | Status | Notes |
|-----------|-----|--------|-------|
| i18next bootstrap + `id` default | i18n-framework.md | ✅ | `frontend/src/i18n/index.ts`, `SettingsProvider` calls `changeLanguage` |
| Domain namespaces registered | i18n-framework.md | ✅ | `registerDomainNamespaces.ts` at bootstrap |
| LookupDialog wired to API | lookup-browse-dialog.md | ✅ | `GET /api/lookup/{type}` |
| LegacyTransactionToolbar + F-keys | transaction-toolbar-and-shortcuts.md | ✅ | Vitest in `LegacyTransactionToolbar.test.tsx` |
| EditableLineGrid row lifecycle | editable-grid-pattern.md | ✅ | Vitest in `EditableLineGrid.test.tsx` |
| Yes/No/Cancel confirm + toast | dialog patterns | ✅ | `confirm.tsx`, `toaster.tsx` |

---

## Phase 1 — Sales

| Screen | PRD | UI wired | Toolbar/F-keys | Lookups | Grid | API | Business rules |
|--------|-----|----------|----------------|---------|------|-----|----------------|
| Sales Order | sales-order.md | ✅ | ✅ | ✅ customer, warehouse, item | ✅ | ✅ CRUD + post + void | ⚠️ credit/overdue via `runWithBusinessRuleConfirm`; P3 free goods deferred |
| Sales Confirmation | sales-confirmation.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sales Return | sales-return.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Credit Memo | credit-memo.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoicing Process | invoicing-process.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Phase 2 — Purchase + Inventory

| Screen | PRD | Status | Notes |
|--------|-----|--------|-------|
| Purchase Order | purchase-order.md | ✅ | API + toolbar + grid |
| Receiving Entry | receiving-entry.md | ✅ | |
| Purchase Return | purchase-return.md | ✅ | |
| Incoming BPB | incoming-bpb.md | ✅ | |
| Outgoing BBK | outgoing-bbk.md | ✅ | |
| Inter-warehouse | inter-warehouse-transfer.md | ✅ | |
| Stock Taking Prep/Record | stock-taking.md | ✅ | |
| Inventory Planning | inventory-planning.md | ✅ | |

---

## Phase 3 — A/R

| Screen | PRD | Status | Notes |
|--------|-----|--------|-------|
| Payment Receipt | payment-receipt.md | ✅ | Batch POST; browse via customer → open invoices |
| Bank Transfer | bank-transfer.md | ✅ | `PaymentReceiptForm` with fixed method |
| PDC Clearance | pdc-clearance.md | ✅ | |
| PDC Cancellation | pdc-clearance-cancellation.md | ✅ | |
| AR Adjustment | ar-adjustment.md | ✅ | |
| Closing A/R | closing-ar.md | ✅ | |
| Recalculate AR Balance | recalculate-ar-balance.md | ✅ | |

---

## Phase 4 — Reports

| Criterion | PRD | Status | Notes |
|-----------|-----|--------|-------|
| Generic `LegacyReportPage` | report-screen-pattern.md | ✅ | Filters, run, CSV export, pagination |
| Registry-driven report keys | report-catalog.md | ✅ | Wired via `legacyReport()` in `modules.tsx` |
| i18n for report chrome | report-screen-pattern.md | ✅ | `reports` namespace |

---

## Phase 5 — Master-data gaps

| Screen | PRD | Status | Notes |
|--------|-----|--------|-------|
| Extra Discount | extra-discount.md | ✅ | |
| Order / Return Codes | order-and-return-codes.md | ✅ | i18n wired Phase 7 |
| Item Pricing & Discount | item-pricing-and-discount.md | ✅ | |
| BP Item | bp-item.md | ✅ | New entity + migration + CRUD |
| Penetration | penetration.md | ✅ | New entity + migration + CRUD |

---

## Phase 6 — System

| Screen | PRD | Status | Notes |
|--------|-----|--------|-------|
| Company Preferences | company-preferences.md | ✅ | |
| Period-End Processes | period-end-processes.md | ✅ | Monthly + day-end |
| Delete Cancelled Document | delete-cancelled-document.md | ✅ | Dry run + execute |
| Backup & Restore | backup-restore.md | ✅ | |
| Cost Operations Entry | cost-operations-entry.md | ❌ | Out of rollout scope (stub remains) |

---

## Phase 7 — i18n sweep (this pass)

| Check | Status |
|-------|--------|
| Domain `id`/`en` key parity (sales, purchase, inventory, ar, reports, masterData, system) | ✅ 0 missing keys |
| Payment method labels | ✅ `ar:paymentMethod.*` |
| Delete-cancelled document types | ✅ `system:deleteCancelled.types.*` |
| Order/Return code page labels | ✅ `masterData:orderCodes.*`, `returnCodes.*` |
| Pre-existing master CRUD pages retrofitted | ⬜ N/A — excluded per i18n-framework PRD |

---

## Regression test results

| Suite | Command | Result |
|-------|---------|--------|
| Frontend Vitest | `npm test -- --run` | ✅ 24 passed |
| Frontend build | `npm run build` | ✅ |
| Backend unit tests | `dotnet test backend/tests/Jaza.Application.Tests` | ✅ 93 passed |
| Backend integration | `dotnet test backend/tests/Jaza.Api.IntegrationTests` | ⚠️ Requires Docker/Testcontainers |

---

## Known deferred items (not blockers for Phase 7)

- P3 free-goods calculation on Sales Order (ExtraDiscount rules) — PRD notes dependency
- Cost Operations Entry system screen — not in Phases 1–6 rollout
- Integration tests — environment dependency (Docker)
- Legacy master CRUD i18n — explicitly out of scope per i18n-framework PRD
