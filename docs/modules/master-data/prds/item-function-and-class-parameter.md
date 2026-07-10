# PRD: Item Function and Class Parameter

## Summary

Item classification parameters: Item Function and Class Parameter masters used for reporting and item segmentation. Legacy masters missing from current app parity matrix.

**Route:** `/master/item-function-and-class-parameter`  
**Permission:** `master` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Item Function & Class | `/master/item-function-and-class-parameter` | Maintain classification codes |

Tabbed: **Item Function** | **Class Parameter**

---

## Data Model

```ts
interface ItemFunction {
  id: string;
  code: string;
  description: string;
}

interface ClassParameter {
  id: string;
  code: string;
  description: string;
  parentId?: string;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| CRUD | `/api/master/item-functions` | Item function master |
| CRUD | `/api/master/class-parameters` | Class parameter master |

---

## UI Behavior

### Toolbar — mode `master`

- [ ] Standard master CRUD per tab

### List

- [ ] Code (uppercase), Description
- [ ] Class Parameter: optional parent hierarchy dropdown

### Item form integration

- [ ] Item master (existing, out of scope for retrofit) will reference these via FK when gap Item edit is built

---

## Permissions

Master module.

---

## Localization keys

Namespace: `masterData.itemClass.*`

| Key | id | en |
|-----|-----|-----|
| `masterData.itemClass.title` | Fungsi & Kelas Barang | Item Function & Class |
| `masterData.itemClass.functionTab` | Fungsi Barang | Item Function |
| `masterData.itemClass.classTab` | Parameter Kelas | Class Parameter |

---

## How This Matches Existing Patterns

Foundation PRDs; master toolbar mode.

---

## Acceptance Criteria

1. Codes maintained via CRUD
2. Available for item reports filter
