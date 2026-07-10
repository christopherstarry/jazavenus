# Inventory Flow — End to End

**Legacy reference:** `Jaza Venus Legacy Program/docs/07-flow-inventory.md`, `docs/business-flows/04-inventory-transaction.md`

**New app routes:** `/inventory/*`  
**Backend:** `StockController`, stock entities in `Jaza.Domain.Stock`

---

## 1. Overview

Inventory operations beyond purchase/sales delivery:

```mermaid
flowchart TB
  BPB[Incoming BPB 36] --> WH[Warehouse OnHand]
  BBK[Outgoing BBK 35] --> WH
  TR[Transfer 34] --> WH
  ST[Stock Taking] --> WH
  WH --> RPT[Stock Position Report]
```

**Warehouse types:** Utama (main), Kanvas (canvas), Konsinyasi (consignment), Field Promo.

---

## 2. Stock ledger model

```mermaid
flowchart LR
  subgraph ledger [Stock Ledger]
    SM[StockMovement]
    SOH[StockOnHand projection]
  end
  PO_GRN[GRN post] --> SM
  DO[Delivery post] --> SM
  BPB[BPB post] --> SM
  BBK[BBK post] --> SM
  TR[Transfer post] --> SM
  ST[Stock take post] --> SM
  SM --> SOH
```

| Movement type | Direction | Source |
|---------------|-----------|--------|
| GoodsReceipt | IN | GRN, Return |
| GoodsIssue | OUT | Delivery, PR |
| AdjustmentIn | IN | BPB |
| AdjustmentOut | OUT | BBK |
| TransferIn/Out | IN/OUT | Inter-warehouse |
| StockTakeIn/Out | IN/OUT | Opname variance |

---

## 3. Available quantity

```
available = on_hand − committed
```

Committed increased on Sales Order post; released on Delivery post.

---

## 4. Inter-warehouse transfer

```mermaid
sequenceDiagram
  participant API
  participant Stock
  participant DB

  API->>Stock: PostTransfer
  Stock->>DB: TransferOut from source WH
  Stock->>DB: TransferIn to dest WH
  Note over DB: Single transaction atomic
```

---

## 5. Stock taking

1. **Preparation:** Snapshot expected qty per SKU/warehouse.
2. **Record:** Enter actual count; compute variance.
3. **Post:** Adjustment movements for variance.

---

## 6. Implementation status

| Feature | Backend | Frontend |
|---------|---------|----------|
| Stock on-hand query | ✅ | Dashboard partial |
| Manual adjustment | ✅ Admin | ❌ |
| BPB document | ❌ | UI shell |
| BBK document | ❌ | UI shell |
| Transfer | ❌ | UI shell |
| Stock taking | ❌ | UI shell |
| Planning | ❌ | UI shell |

See [PRDs](../../prds/inventory/).
