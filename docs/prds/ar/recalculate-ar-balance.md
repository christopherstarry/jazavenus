# PRD: Recalculate AR Balance

## 1. Summary

Rebuild customer outstanding totals from invoice and payment ledger. Legacy admin tool.

**Route:** `/system/recalculate-ar-balance`  
**Permission:** SuperAdmin.

## 2. Business rules

1. Sum open invoices − payments − credit memos per customer.
2. Update `Customer.balance` (or computed view).
3. Log action to audit trail.

## 3. Status

Backend **Missing**.

## 4. Acceptance criteria

- [ ] Recalc matches manual sum for sample customers
- [ ] Audit log entry created
