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

---

## 5. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Bank Transfer | `/ar/bank-transfer-transaction` | Batch transfer payment allocation |

**Note:** Subset of full Payment Receipt — see [payment-receipt.md](payment-receipt.md).

---

## 6. UI Behavior

### Toolbar — mode `transaction`

- [ ] **F2** Save receipt; **F4** browse payments

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` |
| Bank account | `banks` |

### Allocation grid

- [ ] Read-only open invoices for customer
- [ ] Editable **Transfer Applied** column per invoice row
- [ ] Footer: Total Transfer, Remaining unallocated

---

## 7. Permissions

`ar` module.

---

## 8. Localization keys

Namespace: `ar.bankTransfer.*`

| Key | id | en |
|-----|-----|-----|
| `ar.bankTransfer.title` | Transfer Bank | Bank Transfer |
| `ar.bankTransfer.allocation` | Alokasi Transfer | Transfer Allocation |

---

## 9. How This Matches Existing Patterns

Foundation PRDs; A/R feature shell.
