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

---

## 5. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Recalculate AR Balance | `/system/recalculate-ar-balance` | Rebuild customer balances |

---

## 6. UI Behavior

### Toolbar — mode `process`

- [ ] **F5** Execute — run recalc for scope
- [ ] Optional customer filter via `customers` lookup

### Output

- [ ] Progress indicator during batch
- [ ] Results grid: Customer, Old Balance, New Balance, Delta
- [ ] Export CSV

### Dialogs

- [ ] Confirm before execute: "Recalculate AR for all customers in division {division}?"

---

## 7. Permissions

SuperAdmin only.

---

## 8. Localization keys

Namespace: `ar.recalculate.*`

| Key | id | en |
|-----|-----|-----|
| `ar.recalculate.title` | Hitung Ulang Saldo Piutang | Recalculate AR Balance |
| `ar.recalculate.running` | Menghitung... | Recalculating... |

---

## 9. How This Matches Existing Patterns

Process toolbar; audit via `audit.action.*` namespace.
