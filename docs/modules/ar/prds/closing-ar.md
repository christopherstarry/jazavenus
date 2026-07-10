# PRD: Closing A/R

## 1. Summary

Period-end A/R closing. Legacy `frmClosingAR`, `ClosingAR` table.

**Route:** `/system/closing-ar-entry`  
**Permission:** SuperAdmin.

## 2. Business rules

1. Close month: lock AR transactions for period.
2. Record closing date, next period start.
3. Update `Invoiceh` monthly aggregates (legacy); new app computes live.
4. Prevent back-dated payments after close.

## 3. Status

Backend **Missing**; frontend Coming Soon.

## 4. Acceptance criteria

- [ ] Close AR period for year/month
- [ ] Block new payments in closed period
- [ ] Recalculate AR balance tool works after close

---

## 5. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Closing A/R | `/system/closing-ar-entry` | Period-end AR close |

---

## 6. UI Behavior

### Toolbar — mode `process`

- [ ] **F5** Execute — close selected period
- [ ] No line grid

### Form fields

| Field | Lookup type |
|-------|-------------|
| Fiscal year/month | `fiscal-periods` |
| Division | read-only from session |

### Dialogs

- [ ] Confirm: "Close AR for {period}? No back-dated payments allowed."
- [ ] Success toast with closed period summary

---

## 7. Permissions

SuperAdmin only.

---

## 8. Localization keys

Namespace: `ar.closing.*`

| Key | id | en |
|-----|-----|-----|
| `ar.closing.title` | Tutup Piutang | Closing A/R |
| `ar.closing.confirm` | Tutup periode {period}? | Close period {period}? |

---

## 9. How This Matches Existing Patterns

Process toolbar; system route under `/system/`.
