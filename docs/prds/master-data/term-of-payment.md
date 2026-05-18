# PRD: Term of Payment

## 1. Summary
Manage payment terms (e.g., Net 30, Net 60). Used by customers and suppliers.

## 2. Routes
| Screen | Route |
|--------|-------|
| Term Of Payment | `/master/term-of-payment` |

## 3. Data Model
```ts
interface PaymentTerm {
  id: string;
  code: string;         // TermCode (char 3)
  name: string;          // Dscription
  credit_limit: number;
  due_days: number;      // DueDay
}
```

## 4. Database Table
`payment_terms` (from legacy `PaymentTerm`, 6 rows)

## 5. Permissions
Master access: view+edit (no delete). Dev/SuperAdmin: full.

## 6. API — CRUD at `/api/payment-terms`

## 7. Acceptance Criteria
- [ ] Simple table: Code, Name, Credit Limit, Due Days
- [ ] Delete hidden for non-Dev/non-SuperAdmin
