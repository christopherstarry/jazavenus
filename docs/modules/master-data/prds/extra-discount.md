# PRD: Extra Discount (P2/P3)

## Summary

Customer extra discount rules for P2 and P3 pricing tiers including free-goods (P3) thresholds. Legacy extra discount master â€” required for sales order P3 free goods calculation.

**Route:** `/master/extra-discount` (add to `modules.tsx`)  
**Permission:** `master` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Extra Discount | `/master/extra-discount` | Maintain P2/P3 discount rules per customer/item |

---

## Data Model

```ts
interface ExtraDiscount {
  id: string;
  customerId?: string;
  itemId?: string;
  brandId?: string;
  discountType: "P2" | "P3";
  discountPercent: number;
  giftLimit: number;      // P3: qty threshold
  totalGift: number;      // P3: free qty
  validFrom: string;
  validTo: string;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/master/extra-discounts` | List |
| POST | `/api/master/extra-discounts` | Create |
| PUT | `/api/master/extra-discounts/{id}` | Update |
| DELETE | `/api/master/extra-discounts/{id}` | Delete |

---

## UI Behavior

### Toolbar â€” mode `master`

- [ ] F1â€“F3, F9â€“F12 record navigation per [transaction-toolbar-and-shortcuts.md](../../shared/ui-foundation/transaction-toolbar-and-shortcuts.md)

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` (optional) |
| Item | `items` (optional) |
| Brand | `brands` (optional) |

### Form fields

- [ ] Discount type P2/P3 radio
- [ ] P3 fields: Gift Limit, Total Gift visible only when P3 selected
- [ ] Date range pickers

---

## Permissions

Master data CRUD â€” SuperAdmin/Admin edit; others view.

---

## Localization keys

Namespace: `masterData.extraDiscount.*`

| Key | id | en |
|-----|-----|-----|
| `masterData.extraDiscount.title` | Diskon Ekstra | Extra Discount |
| `masterData.extraDiscount.giftLimit` | Batas Hadiah | Gift Limit |

---

## How This Matches Existing Patterns

Master toolbar mode; [lookup-browse-dialog.md](../../shared/ui-foundation/lookup-browse-dialog.md). Referenced by [sales-order.md](../../sales/prds/sales-order.md) P3 rules.

---

## Acceptance Criteria

1. P2/P3 rules saved and resolved at pricing API
2. P3 free goods calculated on SO lines
