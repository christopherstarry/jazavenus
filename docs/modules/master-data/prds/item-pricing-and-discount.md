# PRD: Item Pricing and Discount UI

## Summary

Per-item price and discount maintenance UI. Backend pricing APIs exist; this PRD specifies the **gap** screen for HJP/HPD/HET prices and P1 discount by price tier â€” not retrofitting existing Item master page.

**Route:** `/master/item-pricing-and-discount`  
**Permission:** `master` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Item Pricing | `/master/item-pricing-and-discount` | Edit prices and P1 discounts by item |

---

## Data Model

```ts
interface ItemPricingRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  priceTier: "HJP" | "HPD" | "HET";
  unitPrice: number;
  discountPercent: number;   // P1
  validFrom: string;
  validTo: string;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/pricing/items?search=&priceTier=` | List pricing rows |
| PUT | `/api/pricing/items/{itemId}` | Update prices/discounts |
| GET | `/api/pricing/resolve` | Used by transaction lines (existing) |

---

## UI Behavior

### Toolbar â€” mode `master`

- [ ] **F5** optional bulk import Excel (phase 2)
- [ ] Search + filter by price tier, brand, category

### Filters (lookups)

| Field | Lookup type |
|-------|-------------|
| Brand | `brands` |
| Category | `categories` |
| Item | `items` |

### Editable grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md) on price/discount columns only
- [ ] Item code/name read-only
- [ ] Tab or dropdown for price tier (HJP/HPD/HET)
- [ ] **F2** Save batch changes

---

## Permissions

Master edit â€” Admin+; view for others.

---

## Localization keys

Namespace: `masterData.itemPricing.*`

| Key | id | en |
|-----|-----|-----|
| `masterData.itemPricing.title` | Harga & Diskon Barang | Item Pricing & Discount |
| `masterData.itemPricing.priceTier` | Tingkat Harga | Price Tier |
| `masterData.itemPricing.unitPrice` | Harga Satuan | Unit Price |
| `masterData.itemPricing.discountP1` | Diskon P1 | P1 Discount |

---

## How This Matches Existing Patterns

Editable grid for bulk edit; pricing API already implemented. Referenced by [sales-order.md](../../sales/prds/sales-order.md) line pricing.

---

## Acceptance Criteria

1. Bulk edit prices per tier
2. Changes reflected in `GET /api/pricing/resolve` on transactions
3. Valid date range enforced
