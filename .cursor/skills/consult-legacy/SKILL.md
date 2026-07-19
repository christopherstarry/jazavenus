---
name: consult-legacy
description: Researches legacy VB6 Sales Inventory behavior from the sibling Legacy Program workspace for Jaza Venus parity. Use when PRD is incomplete, business rules are unclear, or mapping legacy forms to new routes.
disable-model-invocation: true
---

# Consult Legacy (Read-Only)

The legacy app lives in sibling workspace **Jaza Venus Legacy Program**. Use for behavior lookup only — **never modify** VB6 source or legacy docs unless explicitly asked.

## When to use

- PRD missing field-level behavior
- Parity matrix gap notes reference legacy form (e.g. `frmCustomer`)
- Discount, tax serial, stock commit, or status transition unclear
- ETL/schema question — cross-check [schema-mapping.md](../../../docs/schema-mapping.md)

## Search order

1. **Parity matrix** — legacy form → new route mapping
2. **Legacy docs** (if workspace available):
   - `../../../../Jaza Venus Legacy Program/docs/04-business-domain.md` — glossary ID/EN
   - `docs/05`–`09` flow docs, `docs/business-flows/`
   - `docs/11`–`13` PRDs (master, transactions, reports)
   - `docs/14-naming-conventions-notes.md` — toolbar F-keys, form states
   - `docs/16-critical-issues-and-risks.md`
3. **VB6 source** (read-only): `UI/*.frm`, `BusinessObject/`, `RuleModule.bas`
4. **New app docs** — [brd-parity-and-changes.md §3](../../../docs/brds/brd-parity-and-changes.md) for intentional changes

## Output format

```markdown
## Legacy behavior: {Topic}

**Legacy source:** {form/doc path}
**New mapping:** {route / entity / parity matrix row}

### Behavior (legacy)
- ...

### Intentional change (if any)
- ... (cite brd-parity-and-changes §3)

### Recommendation for new app
- ...
```

## Schema mapping

For table/column questions, use [schema-mapping.md](../../../docs/schema-mapping.md) and [naming-conventions.md](../../../docs/database/naming-conventions.md). Legacy SQL Server names → EF entities.

## Don't

- Edit `Jaza Venus Legacy Program/` files
- Assume legacy behavior when BRD §3 documents an intentional change (e.g. 1-step invoice, PBKDF2 passwords)
- Invent rules not found in legacy source or docs — state "unverified" explicitly

## If Legacy workspace unavailable

Use parity matrix, new app PRDs/flows, and [legacy-schema.txt](../../../docs/legacy-schema.txt) only. Note that VB6 form-level behavior was not verified.
