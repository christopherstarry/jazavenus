# PRD: Credit Memo

## 1. Summary

Issue credit notes to reduce customer A/R. Legacy `frmCreditMemo` (ObjType 37). Requires Faktur Pajak CN serial via `SeriFakturCN.bas`.

**Permission:** `sales` module.

## 2. User stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| CM-01 | Operator | Create credit memo for customer | A/R is reduced |
| CM-02 | Operator | Link to return or invoice | Audit trail preserved |
| CM-03 | System | Generate Faktur CN serial | Tax compliance |

## 3. Data model (planned)

| Entity | Legacy |
|--------|--------|
| `CreditMemo` | CreditMemo |
| `CreditMemoLine` | CreditMemoDetail1 |

## 4. Status

| Layer | Status |
|-------|--------|
| Backend | **Missing** |
| API | **Missing** |
| Frontend | **Missing** (not in module tree) |

## 5. Acceptance criteria

- [ ] Create CM with customer and lines
- [ ] Post reduces customer balance
- [ ] Faktur CN serial generated for PKP customers

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Credit Memo | `/sales/credit-memo` | Issue credit notes (add to `modules.tsx`) |

---

## 8. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** Browse `credit-memos`; **F5** Print Faktur CN

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` |
| Linked return/invoice | `sales-returns` / `invoices` |
| Faktur CN serial | `tax-registrations` |

### Line grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md) â€” negative amounts allowed

---

## 9. Permissions

`sales` module; post requires Admin+.

---

## 10. Localization keys

Namespace: `sales.creditMemo.*`

| Key | id | en |
|-----|-----|-----|
| `sales.creditMemo.title` | Nota Kredit | Credit Memo |
| `sales.creditMemo.fakturCn` | Faktur CN | Tax Credit Note |

---

## 11. How This Matches Existing Patterns

Foundation PRDs; new route in `modules.tsx` under Sales.
