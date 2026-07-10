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
