# PRD: Inter-Warehouse Transfer

## 1. Summary

Move stock between warehouses. Legacy `frmTransfer` (ObjType 34).

**Route:** `/inventory/inter-warehouse-transaction`  
**Permission:** `inventory` module.

## 2. Business rules

1. Source warehouse: decrement on-hand.
2. Destination warehouse: increment on-hand.
3. Atomic: `TransferOut` + `TransferIn` movements in one transaction.
4. Supports Utama, Kanvas, Konsinyasi, Field Promo warehouse types.

## 3. Data model (planned)

| Entity | Legacy |
|--------|--------|
| `StockTransfer` | Transfer |
| `StockTransferLine` | TransferDetail1 |

## 4. Status

Enum `TransferIn/TransferOut` exists; no document entity or API.

## 5. Acceptance criteria

- [ ] Create transfer with from/to warehouse and lines
- [ ] Post atomically updates both warehouses
- [ ] Transfer report

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Inter-Warehouse Transfer | `/inventory/inter-warehouse-transaction` | Move stock between warehouses |

---

## 7. UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** browse `stock-transfers`

### Header lookups

| Field | Lookup type |
|-------|-------------|
| From warehouse | `warehouses` |
| To warehouse | `warehouses` (exclude same as from) |

### Line grid

- [ ] [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md)
- [ ] Source warehouse available qty check

---

## 8. Permissions

`inventory` module.

---

## 9. Localization keys

Namespace: `inventory.transfer.*`

| Key | id | en |
|-----|-----|-----|
| `inventory.transfer.title` | Transfer Antar Gudang | Inter-Warehouse Transfer |
| `inventory.transfer.from` | Dari Gudang | From Warehouse |
| `inventory.transfer.to` | Ke Gudang | To Warehouse |

---

## 10. How This Matches Existing Patterns

Foundation PRDs; `InventoryTransactionFormPage.tsx`.
