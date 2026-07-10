# PRD: Outgoing Transaction (BBK)

## 1. Summary

Issue stock out of warehouse without sales delivery. Legacy `frmGoodIssue` (ObjType 35).

**Route:** `/inventory/outgoing-transaction-bbk`  
**Permission:** `inventory` module.

## 2. Business rules

1. Non-sales stock issue (damage, sample, promo).
2. On post: `StockMovement(AdjustmentOut)` or dedicated BBK type.
3. Available qty check before post.

## 3. Status

Backend partial; frontend UI shell.

## 4. Acceptance criteria

- [ ] First-class BBK document entity
- [ ] Post decreases on-hand
- [ ] BBK report support

---

## 5. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Outgoing BBK | `/inventory/outgoing-transaction-bbk` | Non-sales stock issue |

---

## 6. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** browse BBK documents

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Warehouse | `warehouses` |
| Issue reason | native select |

### Line grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md)
- [ ] Available qty validation on save/post

---

## 7. Permissions

`inventory` module.

---

## 8. Localization keys

Namespace: `inventory.bbk.*`

| Key | id | en |
|-----|-----|-----|
| `inventory.bbk.title` | BBK (Barang Keluar) | Outgoing Stock (BBK) |

---

## 9. How This Matches Existing Patterns

Foundation PRDs; `InventoryTransactionFormPage.tsx`.
