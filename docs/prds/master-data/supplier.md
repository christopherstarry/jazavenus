# PRD: Principle (Supplier)

## 1. Summary
Manage supplier/principal companies that provide products. Linked to purchase orders, goods receipts, and purchase returns.

## 2. Routes
| Screen | Route |
|--------|-------|
| Principle List | `/master/principle` |

## 3. Data Model
```ts
interface Supplier {
  id: string;
  code: string;              // SuppCode (varchar 15)
  name: string;               // SuppName
  address: string;
  city: string;
  state: string;
  zip_code: string;
  area_code: string;
  phone1: string;
  phone2: string;
  fax: string;
  email: string;
  payment_term: string;
  price_tier: string;
  notes: string;
  salesman: string;
  hp1: string;
  hp2: string;
  supervisor: string;         // Atasan
  position: string;           // Jabatan
  supervisor_hp: string;
  npwp_number: string;
  npwp_date: string;
  pkp_number: string;
  pkp_date: string;
  discount_retail: number;
  discount_wholesale: number;
  payment_days_retail: number;
  payment_days_wholesale: number;
  is_returnable: boolean;
  visit_day: string;
  note: string;
  product_line1: string;
  product_line2: string;
  is_locked: boolean;
  is_active: boolean;
}
```

## 4. Database Table
`suppliers` (from legacy `Supplier`, 173 rows)

## 5. Permissions
Same as Master Maintenance: Didi, Pai, Nenden, Atep, Alvin can view+edit (no delete). Dev/SuperAdmin have full access.

## 6. API
| Method | Path |
|--------|------|
| `GET` | `/api/suppliers?search=&page=&pageSize=` |
| `GET` | `/api/suppliers/:id` |
| `POST` | `/api/suppliers` |
| `PUT` | `/api/suppliers/:id` |
| `DELETE` | `/api/suppliers/:id` |

## 7. History / Audit
Every create, update, and delete on supplier records is logged to `audit_logs`. Developer and SuperAdmin can view the full change history at `/system/audit-history` or click the "Audit History" button on any supplier detail page. See `docs/prds/master-data/audit-history.md` for the full spec.

## 8. Acceptance Criteria
- [ ] Supplier list with search by code/name
- [ ] 20+ fields editable in create/edit form
- [ ] Delete hidden for non-Dev/non-SuperAdmin
- [ ] Payment terms and price tier as dropdowns from related tables
