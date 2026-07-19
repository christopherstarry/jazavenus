---
name: verify-parity
description: Verifies Jaza Venus feature parity against PRDs, code, and the legacy-to-new parity matrix. Use for UAT prep, gap analysis, "is this done?", or cutover readiness checks.
disable-model-invocation: true
---

# Verify Parity

Produces evidence-based status — not opinion. Read-only unless user asks to fix gaps.

## Step 1: Identify feature

From user request, find:

- Legacy form name or feature label
- Parity matrix row in [legacy-to-new-parity-matrix.md](../../../docs/parity/legacy-to-new-parity-matrix.md)
- PRD path under `docs/modules/{module}/prds/`

## Step 2: Three-layer check

| Layer | Evidence to find |
|-------|------------------|
| **Backend** | Entity in `Jaza.Domain`, service/controller, migrations if needed |
| **API** | Routes in controller; callable endpoints per PRD |
| **Frontend** | Page in `frontend/src/features/`, registered in `modules.tsx`, wired to API (not mock/hardcoded) |

Status rules:

- **Implemented** — all three wired and usable
- **Partial** — any layer missing or UI not API-connected
- **Missing** — no meaningful implementation

## Step 3: Business rules (transaction features)

Cross-check [project-goals.md §5](../../../docs/project-goals.md) and [brd-parity-and-changes.md §2](../../../docs/brds/brd-parity-and-changes.md):

- Document chain linking
- P1/P2/P3 discounts
- Credit plafond + overdue (with override)
- Stock commit / Available formula
- Faktur Pajak serial (invoicing)
- Division filter on queries

Cite file paths where implemented or note gap.

## Step 4: PRD acceptance criteria

Diff PRD checklist vs actual behavior. List unchecked AC items with file evidence.

## Step 5: Optional cross-checks

- [use-cases/overview.md](../../../docs/use-cases/overview.md) — actor scenario status
- [phase-7-acceptance-checklist.md](../../../docs/modules/qa/phase-7-acceptance-checklist.md) — UI parity QA

## Output format

```markdown
## Parity: {Feature Name}

| Layer | Status | Evidence |
|-------|--------|----------|
| Backend | Implemented / Partial / Missing | `path/to/file` |
| API | ... | ... |
| Frontend | ... | ... |

**Overall:** Implemented / Partial / Missing

### Gaps
1. ...

### Business rules
- [x] or [ ] {rule} — {evidence or gap}

### Recommended next steps
1. ...
```

## Step 6: Update docs (if fixing)

If user proceeds to fix gaps, update parity matrix row and re-run this skill.

## Don't

- Mark Implemented without API-connected frontend
- Ignore label mismatches noted in parity matrix gap notes
