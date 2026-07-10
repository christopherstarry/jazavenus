# PRD: Customer Penetration

## Summary

Track customer product penetration (SKU coverage) by outlet/class. Legacy penetration master for sales analysis reports.

**Route:** `/master/penetration`  
**Permission:** `master` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Penetration | `/master/penetration` | Define penetration targets and actuals |

---

## Data Model

```ts
interface Penetration {
  id: string;
  customerId: string;
  itemId?: string;
  brandId?: string;
  categoryId?: string;
  targetSkuCount: number;
  periodYear: number;
  periodMonth: number;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/master/penetrations` | List |
| POST | `/api/master/penetrations` | Create |
| PUT | `/api/master/penetrations/{id}` | Update |
| DELETE | `/api/master/penetrations/{id}` | Delete |

---

## UI Behavior

### Toolbar — mode `master`

- [ ] Master CRUD toolbar

### Lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` |
| Brand | `brands` |
| Category | `categories` |
| Item | `items` |

### List + edit

- [ ] Filter by period, customer, brand
- [ ] Target SKU count editable

---

## Permissions

Master module.

---

## Localization keys

Namespace: `masterData.penetration.*`

| Key | id | en |
|-----|-----|-----|
| `masterData.penetration.title` | Penetrasi | Penetration |
| `masterData.penetration.targetSku` | Target SKU | Target SKU Count |

---

## How This Matches Existing Patterns

Foundation PRDs; feeds sales penetration reports.

---

## Acceptance Criteria

1. Penetration data exportable to sales reports
2. Period filter works
