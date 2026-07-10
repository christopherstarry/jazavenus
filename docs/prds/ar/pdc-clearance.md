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
