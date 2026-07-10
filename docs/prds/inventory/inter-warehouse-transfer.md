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
