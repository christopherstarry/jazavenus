# Sales Flow — End to End

**Legacy reference:** `Jaza Venus Legacy Program/docs/06-flow-sales-ar.md`, `docs/business-flows/02-sales-transaction.md`

**New app routes:** `/sales/*`  
**Backend:** `OutboundController`, `InvoicingController`, `StockController`

---

## 1. Overview

The sales cycle follows a strict document chain. Each downstream document references its source via `base_type`, `base_entry`, `base_line`.

```mermaid
flowchart LR
  SO[Sales Order 27] --> SC[Sales Confirmation 28]
  SC --> INV[Invoice 30]
  INV --> PAY[Payment 38]
  SC --> RET[Sales Return 29]
  RET --> CM[Credit Memo 37]
```

---

## 2. Sequence: Order to Payment

```mermaid
sequenceDiagram
  participant User
  participant SPA as React SPA
  participant API as Jaza.Api
  participant App as Application
  participant DB as PostgreSQL

  User->>SPA: Create Sales Order
  SPA->>API: POST /api/outbound/sales-orders
  API->>App: Validate credit/overdue
  App->>DB: Insert SalesOrder Draft
  User->>SPA: Post SO
  SPA->>API: POST .../post
  App->>DB: Reserve stock committed
  App->>DB: Status Posted

  User->>SPA: Create Delivery from SO
  SPA->>API: POST /api/outbound/delivery-orders
  App->>DB: Link base lines from SO
  User->>SPA: Post Delivery
  App->>DB: StockMovement GoodsIssue
  App->>DB: Decrement on_hand committed

  User->>SPA: Create Invoice from Delivery
  SPA->>API: POST /api/invoices
  App->>DB: Link base lines from DO
  User->>SPA: Post Invoice
  App->>DB: Update customer balance
  opt PKP customer
    App->>DB: Allocate Faktur Pajak serial
  end

  User->>SPA: Record Payment
  SPA->>API: POST /api/invoices/id/payments
  App->>DB: Payment allocation
  App->>DB: Reduce invoice outstanding
```

---

## 3. Document state machine

```mermaid
stateDiagram-v2
  [*] --> Draft: Create
  Draft --> Posted: Post
  Draft --> Cancelled: Cancel
  Posted --> Closed: Fully delivered/invoiced/paid
  Posted --> Cancelled: Void SuperAdmin
  Cancelled --> [*]
  Closed --> [*]
```

| Status | Code | Editable | Referenceable |
|--------|------|----------|---------------|
| Draft | — | Yes | No |
| Open | O | Limited | Yes |
| Cancelled | B | No | No |
| Closed | C | No | No (historical) |

---

## 4. Credit control gates

| Stage | Balance checked | Legacy function |
|-------|----------------|-----------------|
| Sales Order | OrdersBal | CheckCreditLimit |
| Sales Confirmation | DNotesBal | CheckCreditLimit |
| Invoice | Balance | CheckCreditLimit |

**Rule:** `credit_limit > current_balance + new_total` else block. SuperAdmin can override (legacy F6).

---

## 5. Stock impact

| Event | on_hand | committed |
|-------|---------|-----------|
| SO post | — | +qty |
| SO cancel | — | −qty |
| Delivery post | −qty | −qty |
| Return post | +qty | — |

**Available qty:** `on_hand − committed`

---

## 6. Discount calculation

```
LineTotal = Qty × Price × (1 − P1/100) × (1 − P2/100)
P3FreeGoods = (Qty / GiftLimit) × TotalGift
HeaderTotal = Σ LineTotals − ExtraDiscount% − P3 value
Tax = (HeaderTotal − ExtraDisc) × VAT%
```

---

## 7. New app implementation status

| Step | Backend | Frontend | Business rules |
|------|---------|----------|----------------|
| Sales Order | ✅ | ❌ not wired | ❌ credit/stock |
| Sales Confirmation | ✅ | ❌ not wired | ❌ credit |
| Invoice | ✅ | ❌ not wired | ❌ Faktur serial |
| Payment | ✅ | ❌ not wired | Partial |
| Sales Return | ✅ schema | UI shell | ❌ |
| Credit Memo | ✅ schema | ❌ | ❌ |

Persisted entities: [table-catalog](../../database/table-catalog.md). See [parity matrix](../../parity/legacy-to-new-parity-matrix.md) and transaction PRDs in [prds/transactions/](../../prds/transactions/).

---

## Related

- [Purchase flow](../purchase/overview.md)
- [A/R flow](../ar/overview.md)
- [PRD: Sales Order](../../prds/transactions/sales-order.md)
- [Table catalog](../../database/table-catalog.md)
