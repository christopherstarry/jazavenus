# PRD: Business Partner Item (BP Item)

## Summary

Cross-reference between supplier business partner codes and internal item codes. Legacy BP Item mapping for purchase and EDI integration.

**Route:** `/master/bp-item`  
**Permission:** `master` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| BP Item | `/master/bp-item` | Map supplier SKU to internal item |

---

## Data Model

```ts
interface BpItem {
  id: string;
  supplierId: string;
  supplierItemCode: string;
  itemId: string;
  uom: string;
  conversionFactor: number;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/master/bp-items` | List |
| POST | `/api/master/bp-items` | Create |
| PUT | `/api/master/bp-items/{id}` | Update |
| DELETE | `/api/master/bp-items/{id}` | Delete |

---

## UI Behavior

### Toolbar — mode `master`

- [ ] Standard master CRUD + F9–F12 navigation

### Lookups

| Field | Lookup type |
|-------|-------------|
| Supplier | `suppliers` |
| Item | `items` |

### Grid or form

- [ ] List page with search by supplier code or item code
- [ ] Edit dialog with conversion factor

---

## Permissions

Master CRUD per role.

---

## Localization keys

Namespace: `masterData.bpItem.*`

| Key | id | en |
|-----|-----|-----|
| `masterData.bpItem.title` | BP Item | BP Item |
| `masterData.bpItem.supplierCode` | Kode Supplier | Supplier Code |

---

## How This Matches Existing Patterns

Master data gap screen; foundation PRDs.

---

## Acceptance Criteria

1. Supplier item code resolves to internal item on PO import
2. Unique constraint per supplier + supplier code
