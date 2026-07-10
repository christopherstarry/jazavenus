# PRD: Cost Operations Entry

## Summary

Manual cost adjustment and landed-cost operations entry. Legacy utility for updating item weighted-average cost outside normal GRN flow.

**Route:** `/system/cost-operations-entry`  
**Permission:** SuperAdmin / Admin.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Cost Operations | `/system/cost-operations-entry` | Post cost corrections |

---

## Data Model

```ts
interface CostOperation {
  id: string;
  operationDate: string;
  itemId: string;
  warehouseId: string;
  oldCost: number;
  newCost: number;
  reason: string;
  division: string;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/system/cost-operations` | Create cost adjustment |
| GET | `/api/system/cost-operations` | History list |

---

## UI Behavior

### Toolbar — mode `transaction`

- [ ] **F1** New, **F2** Save/post, **F4** browse history

### Lookups

| Field | Lookup type |
|-------|-------------|
| Item | `items` |
| Warehouse | `warehouses` |

### Form

- [ ] Current cost read-only after item+warehouse select
- [ ] New cost numeric input
- [ ] Reason required

### Dialogs

- [ ] Confirm showing cost delta impact

---

## Permissions

Admin+ only.

---

## Localization keys

Namespace: `system.costOps.*`

| Key | id | en |
|-----|-----|-----|
| `system.costOps.title` | Entri Operasi Biaya | Cost Operations Entry |
| `system.costOps.oldCost` | Biaya Lama | Old Cost |
| `system.costOps.newCost` | Biaya Baru | New Cost |

---

## How This Matches Existing Patterns

Foundation PRDs; links to inventory costing service.

---

## Acceptance Criteria

1. Posted operation updates weighted-average cost
2. Audit log entry created
