# Purchase Flow Ã¢â‚¬â€ End to End

**Legacy reference:** `Jaza Venus Legacy Program/docs/05-flow-purchasing.md`, `docs/business-flows/01-purchase-transaction.md`

**New app routes:** `/purchase/*`  
**Backend:** `InboundController`, `StockController`

---

## 1. Overview

```mermaid
flowchart LR
  PO[Purchase Order 31] --> GRN[Receiving 32]
  GRN --> PR[Purchase Return 33]
```

Purchase receives stock IN. Returns stock OUT to supplier.

---

## 2. Sequence: PO to GRN

```mermaid
sequenceDiagram
  participant User
  participant SPA
  participant API
  participant Stock as StockService
  participant DB

  User->>SPA: Create PO
  SPA->>API: POST /api/inbound/purchase-orders
  API->>DB: Insert PO Draft

  User->>SPA: Post PO
  API->>DB: Status Posted

  User->>SPA: Create GRN from PO
  SPA->>API: POST /api/inbound/grns
  API->>DB: Link PO lines base_type=31

  User->>SPA: Post GRN
  API->>Stock: PostGoodsReceipt
  Stock->>DB: StockMovement GoodsReceipt
  Stock->>DB: Increment on_hand
  Stock->>DB: Update weighted avg cost
  Stock->>DB: Update PO line received_qty
```

---

## 3. Document state machine

Same pattern as sales: Draft Ã¢â€ â€™ Posted Ã¢â€ â€™ Closed/Cancelled.

Partial receiving: PO stays Open until all lines fully received.

---

## 4. Business rules

1. GRN qty Ã¢â€°Â¤ PO qty Ã¢Ë†â€™ already received.
2. On GRN post: stock IN; cost updated (weighted average).
3. Purchase return: stock OUT; link to PO or GRN.
4. Supplier payment terms apply to PO header.

---

## 5. Implementation status

| Step | Backend | Frontend |
|------|---------|----------|
| Purchase Order | Ã¢Å“â€¦ | Ã¢ÂÅ’ not wired |
| Receiving (GRN) | Ã¢Å“â€¦ | Ã¢ÂÅ’ (`GrnsPage` exists, not routed) |
| Purchase Return | Ã¢Å“â€¦ schema | UI shell |

Persisted entities: [table-catalog](../../../database/table-catalog.md). See [PRDs](../prds/).
