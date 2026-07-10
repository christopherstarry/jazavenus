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
