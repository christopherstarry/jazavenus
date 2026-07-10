# PRD: Incoming Transaction (BPB)

## 1. Summary

Receive stock into warehouse without PO (adjustment IN). Legacy `frmGoodReceipt` (ObjType 36).

**Route:** `/inventory/incoming-transaction-bpb`  
**Permission:** `inventory` module.

## 2. Business rules

1. Non-PO stock receipt (found stock, correction IN).
2. On post: `StockMovement(AdjustmentIn)` or dedicated BPB type.
3. Requires warehouse, product, qty, reason.

## 3. Status

| Layer | Status |
|-------|--------|
| Backend | Partial â€” `StockController` adjustments only |
| Frontend | UI shell |

## 4. Acceptance criteria

- [ ] First-class BPB document entity (not generic adjustment)
- [ ] Post increases on-hand
- [ ] Appears in BPB report

---

## 5. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Incoming BPB | `/inventory/incoming-transaction-bpb` | Non-PO stock receipt |

---

## 6. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] Standard transaction toolbar; **F4** browse BPB documents

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Warehouse | `warehouses` |
| Reason / cost type | native select (master) |

### Line grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md): Item, Qty, UOM, Unit Cost

---

## 7. Permissions

`inventory` module.

---

## 8. Localization keys

Namespace: `inventory.bpb.*`

| Key | id | en |
|-----|-----|-----|
| `inventory.bpb.title` | BPB (Barang Masuk) | Incoming Stock (BPB) |

---

## 9. How This Matches Existing Patterns

Foundation PRDs; `InventoryTransactionFormPage.tsx`.
