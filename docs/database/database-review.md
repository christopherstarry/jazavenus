# Database Architecture Review

**Date:** 2026-07-10  
**Reviewer:** Documentation audit (legacy parity project)  
**Documents reviewed:** [database-base-docs.md](database-base-docs.md), `Jaza.Domain` entities, EF migrations, [schema-mapping.md](../schema-mapping.md)

---

## Verdict

**The current database design is NOT OK for full legacy parity deployment.**

The PostgreSQL target schema in `database-base-docs.md` is a **strong foundation** for master data and core transactions, but:

1. Several **legacy-critical modules were marked DROP** that must be restored for parity.
2. **Implemented EF entities lag the design doc** (missing returns, PDC, tax serial, transfers).
3. **Multi-company/division** is under-modeled (string field only).
4. **Stock document tables** use `LIKE ... INCLUDING ALL` without proper FK integrity.
5. **`schema-mapping.md` is still a template** — ETL is not production-ready.

**Recommendation:** Adopt the design doc as baseline, apply the schema additions below, align EF entities, then complete ETL mapping before cutover.

---

## 1. Design doc vs implemented entities

| Design doc table | EF entity exists | Gap |
|------------------|------------------|-----|
| customers, products, brands, etc. | ✅ MasterData entities | Minor naming |
| sales_orders, sales_order_lines | ✅ SalesOrder | — |
| deliveries, delivery_lines | ✅ DeliveryOrder | — |
| invoices, invoice_lines | ✅ Invoice | — |
| payments, payment_allocations | ⚠️ Payment only | No allocation table |
| purchase_orders, goods_receipts | ✅ | — |
| sales_returns | ❌ | Missing |
| credit_memos | ❌ | Missing |
| purchase_returns | ❌ | Missing |
| stock_transfers | ❌ | Missing |
| post_dated_checks | ❌ | Missing |
| tax_invoice_serials | ❌ | TaxRegistration is master only |
| extra_discounts | ❌ | Marked DROP in design |
| consignment | ❌ | Marked DROP |
| ar_period_closings | ❌ | Missing |
| company_settings | ❌ | Missing |

---

## 2. Modules incorrectly marked DROP

These were listed as DROP in `database-base-docs.md` but are **required for legacy parity**:

| Legacy table | Business function | Required action |
|--------------|-------------------|-----------------|
| `ExtraDiscount`, `ExtraDiscountDetail` | P2/P3 customer/brand discounts | **Add** `extra_discounts` + lines |
| `SeriFaktur`, `SeriFakturCN` | Faktur Pajak serial tracking | **Add** `tax_invoice_serials` with allocation |
| `Giro`, `GiroHistory` | Post-dated cheques | **Add** `post_dated_checks` + history |
| `AdjusmentAR` | AR adjustments | **Add** `ar_adjustments` |
| `Consignment` | Consignment stock | **Add** if warehouse type Konsinyasi used |
| `LHPP` | Payment allocation reporting | **Merge** into payment_allocations or restore |
| `OrderCode`, `ReturnCode` | Reason codes | **Add** lookup tables |

---

## 3. Multi-company / division gaps

**Legacy:** Separate SQL Server databases per company (DISTRIBUTIONBDG, TRADINGBDG, etc.) with `CompanyIDKu` filter on all queries.

**New design:** Single tenant; `division` string on transaction headers.

| Issue | Risk | Recommendation |
|-------|------|----------------|
| `doc_num` UNIQUE globally | Collision across divisions | Composite unique `(division, doc_num)` or separate sequences |
| No company_settings table | Cannot store per-division prefs | Add `company_settings` with division key |
| Customer balance not division-scoped | Wrong AR if multi-division | Add `division` to balance computation or separate ledgers |
| Single Neon database | All divisions share DB | Acceptable if division filter enforced in all queries |

**Phase 1:** Division string + composite doc_num uniqueness.  
**Phase 3:** Multi-tenant if separate companies need isolation.

---

## 4. Stock schema integrity issues

The design doc uses:

```sql
CREATE TABLE stock_receipts ( LIKE goods_receipts INCLUDING ALL );
```

**Problems:**
- `LIKE INCLUDING ALL` copies constraints incorrectly across unrelated domains.
- BPB/BBK should be first-class documents with proper FKs, not clones of sales order structure.
- `inventory_balances.committed` must sync with SO post — no DB trigger; application must enforce.

**Recommendation:**

```sql
-- Proper stock documents
CREATE TABLE stock_receipts (
  id UUID PRIMARY KEY,
  doc_num INT NOT NULL,
  division VARCHAR(50),
  warehouse_id UUID REFERENCES warehouses(id),
  doc_date DATE NOT NULL,
  doc_status CHAR(1) DEFAULT 'O',
  reason_code VARCHAR(20),
  UNIQUE(division, doc_num)
);

CREATE TABLE stock_issues ( /* mirror structure */ );
CREATE TABLE stock_transfers (
  from_warehouse_id UUID REFERENCES warehouses(id),
  to_warehouse_id UUID REFERENCES warehouses(id),
  /* ... */
);
```

---

## 5. Index strategy assessment

The index strategy in `database-base-docs.md` is **appropriate** for PostgreSQL at legacy data volumes:

| Pattern | Legacy volume | Index | Verdict |
|---------|--------------|-------|---------|
| invoices by customer+date | 401K headers | `idx_invoices_customer_date` | ✅ Required |
| invoice_lines by product | 4.9M lines | `idx_invoice_lines_product_id` | ✅ Required |
| inventory by warehouse+product | 106K rows | composite on `(warehouse_id, product_id)` | ✅ Required |
| payment_allocations by invoice | 412K rows | `idx_payment_allocations_invoice_num` | ✅ Required |
| Full-text customer name | 17K customers | consider `gin` on name | Optional Phase 2 |

**Missing indexes for new app:**
- `stock_movements(warehouse_id, product_id, occurred_at)` for stock card report
- `audit_logs(created_at, entity_type)` for activity history
- Partial index `WHERE doc_status = 'O'` on open documents for overdue queries

---

## 6. Stored procedure migration

Legacy has **592 stored procedures**. Key business logic SPs must become application services:

| Legacy SP | New location |
|-----------|-------------|
| `spGetNewDocNum*` | `DocumentNumberGenerator` ✅ |
| `spUpdateDeliveryStatus` | `DeliveryOrderService.Post` |
| `spUpdateOrderStatus` | `SalesOrderService.Post` |
| `spUpdateOnhandByStockCard` | `StockService` ✅ partial |
| `spInsertSerifaktur` | `TaxSerialService` ❌ missing |
| `spMonthlyProcess` | `PeriodClosingService` ❌ missing |
| `spAdjustmentARProcess` | `ArAdjustmentService` ❌ missing |
| `UpdateConsignCommited` | `StockService` ❌ missing |

**Do not port SPs to PostgreSQL functions** unless performance requires it — keep logic in `Jaza.Application` for testability.

---

## 7. ETL readiness

| Item | Status |
|------|--------|
| `Jaza.Migration` console | ✅ Exists |
| `schema-mapping.md` | ❌ Template only |
| `legacy-schema-extract.sql` | ✅ Reference script |
| UUID mapping for codes | ❌ Not documented |
| Division migration | ❌ Not documented |
| 2.3M SistemLog rows | Plan: migrate subset or archive |

**Blocker:** Complete `schema-mapping.md` with column-level mappings before cutover.

---

## 8. Required schema additions (summary)

Priority order for full parity:

1. `extra_discounts`, `extra_discount_lines`
2. `tax_invoice_serials` (link to invoices, tax_registrations)
3. `post_dated_checks`, `pdc_clearance_history`
4. `payment_allocations` (split from monolithic Payment)
5. `sales_returns`, `sales_return_lines`
6. `credit_memos`, `credit_memo_lines`
7. `purchase_returns`, `purchase_return_lines`
8. `stock_receipts/issues/transfers` (proper entities)
9. `ar_period_closings`, `company_settings`
10. `ar_adjustments`
11. Composite unique `(division, doc_num)` on all transaction tables

See [erd.md](erd.md) for consolidated diagram.

---

## 9. Sign-off checklist

- [ ] DROP list revised; critical modules restored
- [ ] EF entities match target schema
- [ ] Migrations applied to staging Neon
- [ ] ETL loads sample legacy data; counts match
- [ ] Index strategy validated with EXPLAIN on top 10 queries
- [ ] Division/doc_num uniqueness tested

---

## Related

- [database-base-docs.md](database-base-docs.md)
- [erd.md](erd.md)
- [brd-parity-and-changes.md](../brds/brd-parity-and-changes.md)
- [migration-howto.md](../migration-howto.md)
