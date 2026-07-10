# BRD: Parity and Intended Changes

**Audience:** Engineering, product, deployment stakeholders  
**Purpose:** Reconcile legacy VB6 Sales Inventory scope with the new Jaza Venus app. Documents what must run the same, what is intentionally different, and what remains to build.

---

## 1. Executive summary

The legacy system is a full distribution ERP (VB6 + SQL Server 2000) with ~80 active forms, ~550 Crystal Reports, Indonesian tax compliance (Faktur Pajak), multi-company/division, and deep batch automation.

The new app is a modern web stack (.NET + React + PostgreSQL) with **solid master data and a core procure-to-cash backend skeleton**. Approximately **40% of legacy surface area is partially implemented**; **full parity requires Phases 2–3** documented below.

**Deployment recommendation:** Do not cut over until Phase 1 parity items pass UAT (see [cutover-checklist.md](../cutover-checklist.md)).

---

## 2. What must run the same (non-negotiable)

These legacy behaviors are **business-critical** and must be replicated before production cutover:

| Area | Legacy behavior | Verification |
|------|----------------|--------------|
| Document chain | Order → Delivery → Invoice → Payment with base linking | End-to-end UAT script |
| Discounts | P1 (product), P2 (extra/customer), P3 (free goods) | Sample invoice totals match legacy |
| Credit control | Plafond check at SO/Delivery/Invoice stages | Block + admin override |
| Overdue | Block if past-due invoices exist | Block + admin override |
| Stock | OnHand, IsCommited, AvQty = OnHand − Committed | Stock position report matches |
| Tax | Faktur Pajak serial from TaxNo pool for PKP customers | Serial format + audit log |
| Payments | Cash, Transfer, Check/Giro, Others, Return, Adjustment | Receipt totals match |
| Division | Data scoped by company/division | Users see only their division |
| Document status | O (Open), B (Cancelled), C (Closed) | Status transitions match |

---

## 3. Intended changes in the new app

| Legacy | New app | Rationale |
|--------|---------|-----------|
| VB6 desktop + COM DLL | Web SPA + REST API | Modern UX, remote access |
| SQL Server 2000 | PostgreSQL 17 (Neon) | Cloud hosting, EF Core |
| Crystal Reports (~550) | SQL views + API + React tables/PDF | Maintainability |
| Hardcoded DB credentials | Environment secrets | Security |
| RC4 password storage | PBKDF2 + MFA | Security |
| Multi-company login (4 DBs) | Single tenant + division field | Simplified ops (Phase 1) |
| SIBusinessObject.dll black box | Explicit Application services | Testability |
| DTS → DBF exports | CSV/API integrations | Phase 3 |
| Semblog/Clipper file exchange | API/ETL jobs | Phase 3 |
| Auto Order/Delivery/Invoice batch | Background jobs (Hangfire) | Phase 3 |
| Monthly denormalized tables (InvoiceH) | Live queries with indexes | Performance |
| Employee + Module + AccessControl | ASP.NET Identity + UserModulePermission | Modern auth |

---

## 4. Modules marked DROPPED in database design — decision required

The [database-base-docs.md](../database/database-base-docs.md) lists these as DROP. **For full legacy parity, several must be restored:**

| Module | DB doc says | Business need | Recommendation |
|--------|------------|---------------|----------------|
| ExtraDiscount | DROP | P2/P3 discounts | **Restore** — required for pricing |
| SeriFaktur / tax serial | DROP (simplified) | Faktur Pajak compliance | **Restore** — legal requirement |
| Consignment | DROP | Konsinyasi warehouse type | **Restore** if consignment stock used |
| LHPP | DROP (merged) | Payment allocation reporting | **Restore** or replicate in receipts |
| AdjusmentAR | DROP | AR adjustments | **Restore** |
| GiroHistory | MERGE | PDC audit trail | Keep in post_dated_checks history |

See [database-review.md](../database/database-review.md) for schema recommendations.

---

## 5. Phased delivery plan

### Phase 1 — MVP cutover (minimum viable parity)

**Goal:** Daily operations for sales + purchase + basic inventory + invoice payment.

| Item | Status |
|------|--------|
| Master data (all tabs) | ✅ Implemented |
| PO → GRN → SO → DO → Invoice → Payment (API) | ✅ Backend |
| Wire transaction UIs to API | ❌ Required |
| Credit limit + overdue checks | ❌ Required |
| Stock commitment on SO | ❌ Required |
| Faktur Pajak serial | ❌ Required |
| Daily sales + stock position + outstanding invoice reports | ❌ Required |
| ETL migration (Jaza.Migration) | ⚠️ Template only |

### Phase 2 — Full transaction parity

| Item |
|------|
| Sales return, purchase return, credit memo |
| BPB/BBK/inter-warehouse as first-class documents |
| Stock taking + inventory planning |
| Bank transfer batch, PDC/Giro clearance |
| Closing AR, recalculate balance |
| ExtraDiscount (P2/P3) |
| 15–20 core reports |

### Phase 3 — Automation and integrations

| Item |
|------|
| Auto order/delivery/invoice jobs |
| Semblog / Clipper / DayEndPro B2B replacements |
| Remaining 70+ reports |
| Multi-company if needed |
| Consignment module |

---

## 6. BRD reconciliation with existing client docs

| Existing doc | Alignment |
|--------------|-----------|
| [brd-non-technical.md](brd-non-technical.md) | High-level scope matches; add parity matrix reference |
| [brd-client-bahasa.md](brd-client-bahasa.md) | Client-facing; keep for sign-off |
| [brd-client.html](brd-client.html) | Presentation version |

**Action:** Client BRDs describe the *vision*. This document is the *engineering truth* for what is built vs planned.

---

## 7. Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| SIBusinessObject.dll behavior unknown | Wrong totals, failed posts | UAT against legacy DB snapshots |
| Transaction UI not wired to API | Users cannot operate | Wire before cutover |
| Faktur Pajak missing | Legal non-compliance | Phase 1 blocker |
| 550 Crystal Reports unmigrated | Reports unavailable | Prioritize top 10 by usage |
| Schema drops break parity | Data loss on ETL | Update database-review recommendations |
| Committed secrets in repo | Security breach | Rotate credentials; use env vars |

---

## 8. Sign-off criteria

Before production cutover:

- [ ] Parity matrix shows Phase 1 items as Implemented
- [ ] UAT scripts pass for document chain + discounts + credit + stock
- [ ] ETL loads production data; spot-check 100 customers, 100 invoices
- [ ] Top 10 reports match legacy output (± rounding)
- [ ] Security review findings addressed
- [ ] Training sign-off ([training-signoff.md](../training-signoff.md))

---

## Related documents

- [Legacy-to-new parity matrix](../parity/legacy-to-new-parity-matrix.md)
- [Database review](../database/database-review.md)
- [Cutover checklist](../cutover-checklist.md)
- [Migration howto](../migration-howto.md)
