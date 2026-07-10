# PRD: Order Code and Return Code

## Summary

Reason code lookups for sales orders (Order Code) and returns (Return Code). Legacy small master tables used on SO and Sales Return headers.

**Route:** `/master/order-and-return-codes`  
**Permission:** `master` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Order & Return Codes | `/master/order-and-return-codes` | Maintain reason codes |

Tabbed UI: **Order Codes** | **Return Codes**

---

## Data Model

```ts
interface OrderCode {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface ReturnCode {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST/PUT/DELETE | `/api/master/order-codes` | Order codes CRUD |
| GET/POST/PUT/DELETE | `/api/master/return-codes` | Return codes CRUD |

Lookup: `order-codes`, `return-codes` per [lookup-browse-dialog.md](../../shared/ui-foundation/lookup-browse-dialog.md).

---

## UI Behavior

### Toolbar â€” mode `master`

- [ ] Per-tab CRUD with F9â€“F12 on active tab

### List pages

- [ ] Code, Description, Active columns
- [ ] Search by code/description
- [ ] Inline or dialog edit

---

## Permissions

Master module.

---

## Localization keys

Namespace: `masterData.orderReturnCodes.*`

| Key | id | en |
|-----|-----|-----|
| `masterData.orderReturnCodes.title` | Kode Order & Retur | Order & Return Codes |
| `masterData.orderReturnCodes.orderTab` | Kode Order | Order Codes |
| `masterData.orderReturnCodes.returnTab` | Kode Retur | Return Codes |

---

## How This Matches Existing Patterns

Used by [sales-order.md](../../sales/prds/sales-order.md) and [sales-return.md](../../sales/prds/sales-return.md) header lookups.

---

## Acceptance Criteria

1. Codes available in LookupDialog on transaction forms
2. Inactive codes hidden from browse
