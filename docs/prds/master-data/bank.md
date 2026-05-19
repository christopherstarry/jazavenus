# PRD: Bank

## 1. Summary
Manage bank records used for payments, post-dated checks, and bank transfers.

## 2. Routes
| Screen | Route |
|--------|-------|
| Bank | `/master/bank` |

## 3. Data Model
```ts
interface Bank {
  id: string;
  code: string;         // BankCode (char 4)
  name: string;          // BankName
}
```

## 4. Database Table
`banks` (from legacy `Bank`, 35 rows)

## 5. Permissions
Master access: view+edit (no delete). Dev/SuperAdmin: full.

## 6. API — CRUD at `/api/banks`

## 7. History / Audit
Every create, update, and delete on bank records is logged to `audit_logs`. Developer and SuperAdmin can view the change history at `/system/audit-history`. See `docs/prds/master-data/audit-history.md` for the full spec.

## 8. Acceptance Criteria
- [ ] Simple table: Code, Name
- [ ] Delete hidden for non-Dev/non-SuperAdmin
