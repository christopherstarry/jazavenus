# PRD: PDC / Giro Clearance

## 1. Summary

Clear post-dated cheques (Giro). Legacy `frmCheckGiroClearing` (ObjType 39).

**Routes:**
- `/ar/pdc-clearance-transaction`
- `/ar/pdc-clearance-cancellation`

**Permission:** `ar` module.

## 2. Data model (planned)

| Entity | Legacy |
|--------|--------|
| `PostDatedCheck` | Giro |
| `PdcClearance` | GiroClearing |

Fields: check_number, check_date, bank_id, amount, amount_used, clear_date, status (O/C/X).

## 3. Business rules

1. Giro recorded at payment receipt (`ReceiptDetail2`).
2. Clearance: mark giro cleared; apply to invoice allocation.
3. Cancellation: reverse clearance; restore outstanding PDC.
4. `Invoiceh.PDC` / `PDCPC` tracking per division.

## 4. Status

Backend **Missing**; one frontend shell, one Coming Soon.

## 5. Acceptance criteria

- [ ] Register giro at payment
- [ ] Clear giro against invoices
- [ ] Cancel clearance
- [ ] Outstanding PDC report

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| PDC Clearance | `/ar/pdc-clearance-transaction` | Clear post-dated cheques |
| PDC Cancellation | `/ar/pdc-clearance-cancellation` | Reverse clearance |

See also [pdc-clearance-cancellation.md](pdc-clearance-cancellation.md).

---

## 7. UI Behavior

### Clearance screen â€” mode `transaction`

- [ ] **F4** browse `post-dated-checks` (Outstanding status)
- [ ] Header: Giro #, Bank, Amount, Clear Date
- [ ] Allocation grid: open invoices + **Amount Applied**
- [ ] **F5** Execute clearance

### Cancellation screen

- [ ] Browse cleared PDCs; select to reverse
- [ ] Confirm dialog per [dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md)

---

## 8. Permissions

`ar` module; cancellation may require Admin+.

---

## 9. Localization keys

Namespace: `ar.pdc.*`

| Key | id | en |
|-----|-----|-----|
| `ar.pdc.clearanceTitle` | Kliring Giro | PDC Clearance |
| `ar.pdc.giroNumber` | No. Giro | Cheque No. |
| `ar.pdc.clearDate` | Tanggal Kliring | Clear Date |

Use `pdcStatus.*` for status badges.

---

## 10. How This Matches Existing Patterns

Foundation PRDs; A/R shells.
