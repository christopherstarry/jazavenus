# Database Architecture Review

**Date:** 2026-07-10  
**Reviewer:** Documentation audit (legacy parity project)  
**Documents reviewed:** [database-base-docs.md](database-base-docs.md), `Jaza.Domain` entities, EF migrations, [schema-mapping.md](../schema-mapping.md)

---

## Verdict

**The database schema now covers full legacy parity at the table level** (migration `EnhanceAuditLogs`, 2026-07-10).

Remaining gaps are **application-layer**, not schema:

1. Phase 2 entity **API controllers and business logic** not yet implemented.
2. **Multi-company/division** filter enforcement in queries still required in application code.
3. **`schema-mapping.md`** ETL column mappings need completion before cutover.
4. Optional **PascalCase → snake_case** rename of Phase 1 tables deferred post-UAT.

**Recommendation:** Apply migration to staging Neon, complete ETL mapping, then wire services per parity matrix.

---

## 1. Design doc vs implemented entities

| Design doc table | EF entity exists | Gap |
|------------------|------------------|-----|
| customers, products, brands, etc. | ✅ MasterData entities | Minor naming |
| sales_orders, sales_order_lines | ✅ SalesOrder | Division + base link added |
| deliveries, delivery_lines | ✅ DeliveryOrder | Division + base link added |
| invoices, invoice_lines | ✅ Invoice | TaxSerial, Posted* added |
| payments, payment_allocations | ✅ Both | Allocation API not wired |
| purchase_orders, goods_receipts | ✅ | Division + base link added |
| sales_returns | ✅ `SalesReturn` | API not wired |
| credit_memos | ✅ `CreditMemo` | API not wired |
| purchase_returns | ✅ `PurchaseReturn` | API not wired |
| stock_transfers | ✅ `StockTransfer` | API not wired |
| post_dated_checks | ✅ `PostDatedCheck` | API not wired |
| tax_invoice_serials | ✅ `TaxInvoiceSerial` | Serial engine not wired |
| extra_discounts | ✅ `ExtraDiscount` | API not wired |
| consignment | ❌ | Low priority if Konsinyasi unused |
| ar_period_closings | ✅ `ArPeriodClosing` | Service not wired |
| company_settings | ✅ `CompanySettings` | API not wired |

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
| `Jaza.Migration` console | ✅ Runnable with `LegacyIdMap` + hydrator |
| `schema-mapping.md` | ✅ Load order, division map, DocStatus, master + transaction FK rules |
| `legacy-schema.txt` | ✅ Reference artifact (regenerate from live DB before cutover) |
| `LegacyIdMap` | ✅ Code + DocEntry registry implemented |
| Master migrators (Units–Items) | ✅ Implemented |
| PO / SO / Invoice / Payment+Allocation | ✅ Implemented |
| Line-level detail ETL | ⚠️ Pending |
| UUID code maps | ✅ Via LegacyIdMap at runtime |
| Division migration | ✅ Documented + `--division=` CLI flag |
| Staging wet-run | 📋 Pending Neon apply + legacy SQL connection |

**Next:** Apply `FixForeignKeyBehaviors` to staging; run `--dry-run` per tier in [schema-mapping.md](../schema-mapping.md); complete line-level migrators before cutover.

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

- [x] DROP list revised; critical modules restored in EF
- [x] EF entities match target schema (tables)
- [ ] Migrations applied to staging Neon
- [ ] ETL loads sample legacy data; counts match
- [ ] Index strategy validated with EXPLAIN on top 10 queries
- [ ] Division/doc_num uniqueness tested
- [ ] Phase 2 API services implemented

---

## Related

- [database-base-docs.md](database-base-docs.md)
- [erd.md](erd.md)
- [brd-parity-and-changes.md](../brds/brd-parity-and-changes.md)
- [migration-howto.md](../migration-howto.md)
