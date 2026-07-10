# PRD: Inventory Planning

## 1. Summary

Plan reorders and replenishment based on min/max levels and sales velocity.

**Route:** `/inventory/inventory-planning`  
**Permission:** `inventory` module.

## 2. Business rules

1. Use `Item.min_level`, `max_level`, `reorder_qty`.
2. Compare on-hand + on-order vs thresholds.
3. Suggest PO quantities by supplier.

## 3. Status

Backend **Missing**; frontend UI shell.

## 4. Acceptance criteria

- [ ] Show items below min level
- [ ] Suggest reorder qty
- [ ] Optional: create PO from suggestion

---

## 5. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Inventory Planning | `/inventory/inventory-planning` | Reorder suggestions |

---

## 6. UI Behavior

### Toolbar — mode `process`

- [ ] **F5** Execute — refresh suggestions
- [ ] **Export** Excel optional

### Filters (lookups)

| Field | Lookup type |
|-------|-------------|
| Warehouse | `warehouses` |
| Supplier | `suppliers` |
| Brand | `brands` |

### Output grid

- [ ] Read-only: Item, On Hand, On Order, Min, Max, Suggested Qty, Supplier
- [ ] Checkbox select rows → **Create PO** navigates to `/purchase/purchase-order/new` with pre-filled lines

---

## 7. Permissions

`inventory` module.

---

## 8. Localization keys

Namespace: `inventory.planning.*`

| Key | id | en |
|-----|-----|-----|
| `inventory.planning.title` | Perencanaan Persediaan | Inventory Planning |
| `inventory.planning.suggestedQty` | Qty Disarankan | Suggested Qty |

---

## 9. How This Matches Existing Patterns

Process toolbar mode; no editable line grid.
