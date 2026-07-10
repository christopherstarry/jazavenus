# PRD: Bank Transfer Transaction

## 1. Summary

Record customer payments by bank transfer in batch. Legacy payment receipt with `TrsfrAppld` allocation.

**Route:** `/ar/bank-transfer-transaction`  
**Permission:** `ar` module.

## 2. Business rules

1. Select customer; list open invoices.
2. Allocate transfer amount per invoice (`transfer_applied`).
3. Total transfer = sum of allocations.
4. Update invoice `paid_amount`; customer `balance` decreases.

## 3. Status

Backend **Missing** (invoice-level Payment exists); frontend UI shell.

## 4. Acceptance criteria

- [ ] Batch payment against multiple invoices
- [ ] Transfer amount tracked separately from cash/check
