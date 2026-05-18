# PRD: Tax No Registration

## 1. Summary
Manage tax invoice serial number registrations. Tracks which serial number ranges have been allocated, used, and remaining.

## 2. Routes
| Screen | Route |
|--------|-------|
| Tax Registration | `/master/tax-no-registration` |

## 3. Data Model
```ts
interface TaxRegistration {
  id: string;
  registration_no: number;    // RegistrationNo
  register_date: string;       // RegisterDate
  ref1: string;
  ref2: string;
  comments: string;
  from_no: number;             // FromNo (starting serial)
  to_no: number;               // ToNo (ending serial)
  no_counted: number;          // total allocated
  no_used: number;             // used so far
  // computed: no_counted - no_used = available
}
```

## 4. Database Table
`tax_registrations` (from legacy `TaxNo`, 7 rows)

## 5. Permissions
Master access: view only (cannot edit tax registration — sensitive financial data). Dev/SuperAdmin: full.

## 6. API
| Method | Path |
|--------|------|
| `GET` | `/api/tax-registrations` |
| `GET` | `/api/tax-registrations/:id` |
| `POST` | `/api/tax-registrations` (Dev/SuperAdmin only) |
| `PUT` | `/api/tax-registrations/:id` (Dev/SuperAdmin only) |
| `DELETE` | `/api/tax-registrations/:id` (Dev/SuperAdmin only) |

## 7. Acceptance Criteria
- [ ] Table shows: Reg No, Date, From-No, To-No, Used, Available (computed)
- [ ] Create/Edit restricted to Dev/SuperAdmin
- [ ] Regular Master users see read-only view
