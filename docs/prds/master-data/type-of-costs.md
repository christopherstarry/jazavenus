# PRD: Type of Costs

## 1. Summary
Manage cost categories used in operational expense tracking. Simple lookup table.

## 2. Routes
| Screen | Route |
|--------|-------|
| Type Of Costs | `/master/type-of-costs` |

## 3. Data Model
```ts
interface CostType {
  id: string;
  code: string;       // char(2)
  name: string;        // varchar(50)
}
```

## 4. Database Table
`cost_types` (from legacy `CodeDescription` or new — minimal data, ~5 rows)

## 5. Permissions
Same as Master Maintenance: Didi, Pai, Nenden, Atep, Alvin can view+edit (no delete). Dev/SuperAdmin have delete.

## 6. API
| Method | Path |
|--------|------|
| `GET` | `/api/cost-types` |
| `POST` | `/api/cost-types` |
| `PUT` | `/api/cost-types/:id` |
| `DELETE` | `/api/cost-types/:id` |

## 7. Acceptance Criteria
- [ ] Simple CRUD table with Code + Name columns
- [ ] Delete hidden for non-Dev/non-SuperAdmin
