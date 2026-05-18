# PRD: Employee

## 1. Summary
Manage employees who use the system. Maps to the old `insys-common.dbo.Employee` table. Each employee has a login, personal info, and can be locked/activated.

## 2. Routes
| Screen | Route |
|--------|-------|
| Employee List | `/master/employee` |

## 3. Data Model

```ts
interface Employee {
  id: string;           // UUID
  code: string;         // EmplCode (char 8)
  name: string;         // EmplName (varchar 100)
  address: string;      // varchar 254
  city: string;         // varchar 100
  state: string;        // varchar 100
  zip_code: string;     // varchar 8
  phone1: string;       // varchar 20
  phone2: string;       // varchar 20
  fax: string;           // varchar 20
  email: string;        // varchar 50
  is_locked: boolean;   // Locked
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## 4. Database Table

Our new schema: `app_users` (already built in auth system). The old `Employee` table from `insys-common` provides initial data for migration.

## 5. What Users Can Do

| Action | Developer | SuperAdmin | Admin (with Master access) |
|--------|-----------|------------|---------------------------|
| View list | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Create new | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ✅ |
| Delete | ✅ | ✅ | ❌ (Delete button hidden) |

**Who has Master access:** Didi, Pai, Nenden, Atep, Alvin
**Who does NOT:** Yane, Ilham, Robby, Nisa

> Note: Employee management is primarily done via the **Manage Users** page (`/system/manage-users`) where Dev/SuperAdmin manage auth credentials. The Employee page under Master is a read-only directory of staff members.

## 6. UI Behavior

### List Page
- Search by name or code
- Table columns: Code, Name, City, Phone, Status (Active/Locked)
- Paginated (20 per page)
- New Employee button (hidden if no edit access)
- Edit button per row (disabled if no edit access)
- Delete button per row (hidden if no delete access)
- Empty state: "No employees found"

## 7. API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/employees?search=&page=1&pageSize=20` | List |
| `GET` | `/api/employees/:id` | Detail |
| `POST` | `/api/employees` | Create (Dev/SuperAdmin) |
| `PUT` | `/api/employees/:id` | Update (Dev/SuperAdmin) |
| `DELETE` | `/api/employees/:id` | Delete (Dev/SuperAdmin only) |

## 8. Legacy Table Reference

Source: `insys-common.dbo.Employee` (12 rows) mapped to `app_users`.

## 9. Acceptance Criteria
- [ ] Employee list loads with search and pagination
- [ ] Users with Master access can view, create, edit
- [ ] Delete button hidden for non-Dev/non-SuperAdmin
- [ ] Users without Master access cannot open this page (sidebar grayed out)
