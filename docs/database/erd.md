# Entity Relationship Diagram — Jaza Venus

Consolidated ERD of **target schema** (design doc + parity additions). Implemented entities shown solid; planned additions dashed.

---

## 1. Master data core

```mermaid
erDiagram
  customers ||--o{ customer_addresses : has
  customers }o--|| salesmen : assigned
  customers }o--|| collectors : assigned
  customers }o--|| payment_terms : uses
  customers }o--|| price_tiers : default_price

  products }o--|| brands : belongs
  products }o--|| item_categories : belongs
  products ||--o{ product_prices : has
  products ||--o{ product_discounts : has
  products ||--o{ inventory_balances : stocked

  warehouses ||--o{ inventory_balances : holds
  warehouses }o--|| warehouse_types : type

  suppliers ||--o{ purchase_orders : receives
```

---

## 2. Sales document chain

```mermaid
erDiagram
  customers ||--o{ sales_orders : places
  sales_orders ||--|{ sales_order_lines : contains
  sales_orders ||--o{ delivery_orders : fulfills
  delivery_orders ||--|{ delivery_order_lines : contains
  delivery_orders ||--o{ invoices : bills
  invoices ||--|{ invoice_lines : contains
  invoices ||--o{ payments : receives
  invoices ||--o| tax_invoice_serials : may_have

  sales_orders }o--|| warehouses : ships_from
  delivery_orders }o--|| warehouses : ships_from
  sales_order_lines }o--|| products : item
  delivery_order_lines }o--|| products : item
  invoice_lines }o--|| products : item

  sales_returns }o--|| customers : returns_to
  sales_returns ||--|{ sales_return_lines : contains
  credit_memos }o--|| customers : credits
  credit_memos ||--|{ credit_memo_lines : contains
```

*Dashed entities (`sales_returns`, `credit_memos`, `tax_invoice_serials`) are planned — not yet in EF.*

---

## 3. Purchase chain

```mermaid
erDiagram
  suppliers ||--o{ purchase_orders : supplies
  purchase_orders ||--|{ purchase_order_lines : contains
  purchase_orders ||--o{ goods_receipts : received_by
  goods_receipts ||--|{ goods_receipt_lines : contains
  purchase_returns }o--|| suppliers : returned_to
  purchase_returns ||--|{ purchase_return_lines : contains

  purchase_order_lines }o--|| products : item
  goods_receipt_lines }o--|| products : item
```

---

## 4. Stock ledger

```mermaid
erDiagram
  products ||--o{ stock_movements : moves
  warehouses ||--o{ stock_movements : at
  stock_movements }o--|| stock_movement_types : type

  products ||--o{ stock_on_hand : projects
  warehouses ||--o{ stock_on_hand : projects

  stock_transfers ||--|{ stock_transfer_lines : contains
  stock_receipts ||--|{ stock_receipt_lines : contains
  stock_issues ||--|{ stock_issue_lines : contains
```

---

## 5. A/R and payments

```mermaid
erDiagram
  customers ||--o{ payments : pays
  payments ||--|{ payment_allocations : allocates
  payment_allocations }o--|| invoices : against

  customers ||--o{ post_dated_checks : holds
  post_dated_checks ||--o{ pdc_clearance_history : cleared_via

  customers ||--o{ ar_adjustments : adjusted
  ar_period_closings ||--|| fiscal_periods : closes
```

---

## 6. Auth and audit

```mermaid
erDiagram
  app_users ||--o{ user_module_permissions : has
  app_users ||--o{ user_report_permissions : has
  app_users ||--o{ refresh_tokens : has
  app_users ||--o{ audit_logs : performs
  app_users ||--o{ user_preferences : prefers

  tax_registrations ||--o{ tax_invoice_serials : pool
```

---

## 7. Key relationships summary

| From | To | Cardinality | FK field |
|------|-----|-------------|----------|
| SalesOrderLine | SalesOrder | N:1 | order_id |
| DeliveryOrderLine | SalesOrderLine | N:1 | base_entry, base_line |
| InvoiceLine | DeliveryOrderLine | N:1 | base_entry, base_line |
| PaymentAllocation | Invoice | N:1 | invoice_id |
| StockMovement | Product, Warehouse | N:1 | product_id, warehouse_id |
| GoodsReceiptLine | PurchaseOrderLine | N:1 | base_entry, base_line |

---

## 8. Legacy → new naming quick reference

| Legacy | New table |
|--------|-----------|
| Order | sales_orders |
| Delivery | deliveries / delivery_orders |
| Invoice | invoices |
| Receipt | payments |
| Giro | post_dated_checks |
| Item | products |
| CustmrCode | customers.code |
| Inventory | inventory_balances + stock_movements |

Full mapping: [database-base-docs.md](database-base-docs.md) §4.

---

## Related

- [database-review.md](database-review.md)
- [schema-mapping.md](../schema-mapping.md)
