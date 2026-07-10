# Performance Guide — Jaza Venus

**Purpose:** Guidance to keep the new app fast and avoid performance issues at production scale.  
**Context:** Legacy DB has millions of transaction rows (4.9M invoice lines, 4.9M delivery lines). New app must handle similar volumes on Neon PostgreSQL.

---

## 1. Database indexing

Follow the index strategy in [database-base-docs.md](../database/database-base-docs.md) §5. Every transaction table needs:

1. Primary key (UUID)
2. Unique `(division, doc_num)` — not global doc_num alone
3. FK indexes on all foreign keys
4. `doc_date` index for date-range queries
5. `doc_status` partial index for open documents

### Critical composite indexes

```sql
CREATE INDEX idx_invoices_customer_date ON invoices(customer_id, doc_date);
CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX idx_stock_movements_wh_product_date 
  ON stock_movements(warehouse_id, product_id, occurred_at DESC);
CREATE INDEX idx_invoices_open ON invoices(customer_id, doc_due_date) 
  WHERE doc_status = 'O';
```

Run `EXPLAIN ANALYZE` on top 10 report queries before cutover.

---

## 2. Pagination

All list endpoints must use pagination. Pattern in [PagedResult.cs](../../backend/src/Jaza.Application/Common/PagedResult.cs):

```csharp
public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);
```

**Rules:**
- Default page size: 25; max: 100
- Never return unbounded lists (customers 17K, invoice lines millions)
- Frontend: use cursor or page+total for grids
- Reports: stream or paginate; never load 4M rows into memory

---

## 3. EF Core query hygiene

### Avoid N+1

```csharp
// Bad
var orders = await _db.SalesOrders.ToListAsync();
foreach (var o in orders) { var lines = o.Lines; } // N+1

// Good
var orders = await _db.SalesOrders
  .Include(o => o.Lines)
  .AsNoTracking()
  .ToListAsync();
```

### Use AsNoTracking for read-only

Reports, lookups, and list screens should use `.AsNoTracking()`.

### Project early

```csharp
// Good for list views
var items = await _db.Invoices
  .AsNoTracking()
  .Select(i => new InvoiceListDto(i.Id, i.DocNum, i.CustomerName, i.Total))
  .ToListAsync();
```

### Split queries for large includes

```csharp
.AsSplitQuery() // when including multiple collections
```

---

## 4. Large table patterns

| Table | Est. rows | Strategy |
|-------|-----------|----------|
| invoice_lines | 4.9M | Paginate; aggregate in SQL for reports |
| delivery_lines | 4.9M | Same |
| sales_order_lines | 4M | Same |
| stock_movements | Growing | Partition by year (Phase 2) |
| audit_logs | Growing | Retention policy; archive > 2 years |
| legacy_audit_log | 2.3M | Migrate subset only |

### Report queries

- Pre-aggregate daily/monthly in materialized views (replace legacy InvoiceH)
- Refresh materialized views nightly via Hangfire job
- Example: `CREATE MATERIALIZED VIEW mv_daily_sales AS SELECT ...`

---

## 5. Stock service performance

`StockService` updates `StockOnHand` projection on every movement. Rules:

1. Single DB transaction per document post (header + lines + movements + on-hand)
2. Row-level lock on `stock_on_hand` via `SELECT ... FOR UPDATE`
3. Avoid recalculating entire warehouse — update incrementally

Legacy `spUpdateOnhandByStockCard` recalc is expensive; use only for admin repair tool.

---

## 6. Connection pooling (Neon)

Neon uses PgBouncer pooler endpoint (`-pooler` in hostname).

**appsettings Production:**
```
Host=ep-xxx-pooler.region.aws.neon.tech;Pooling=true;Minimum Pool Size=5;Maximum Pool Size=50;Connection Idle Lifetime=300;
```

**Rules:**
- Use pooler endpoint for API (transaction mode)
- Direct endpoint only for migrations/ETL
- Do not hold connections across await user input
- Set command timeout: 30s default, 120s for reports

---

## 7. API response times (targets)

| Endpoint type | Target p95 |
|---------------|------------|
| Master CRUD list | < 200ms |
| Transaction get by id | < 300ms |
| Transaction post | < 1s |
| Report (paginated) | < 2s |
| PDF generation | < 5s |

Monitor via Serilog timing enricher or APM (Phase 2).

---

## 8. Frontend performance

- TanStack Query: staleTime 30s for master data; 0 for transactions
- Virtualize large grids (react-virtual) for 1000+ rows
- Lazy-load report pages (already in modules.tsx)
- Debounce search inputs 300ms
- Do not fetch entire customer list — server-side search with pagination

---

## 9. Caching strategy

| Data | Cache | TTL |
|------|-------|-----|
| Reference data (banks, outlet types) | Memory / React Query | 5 min |
| User permissions | React Query | Session |
| Document series counters | DB only (no cache) | — |
| Report aggregates | Materialized view | 24h refresh |

No distributed cache required for Phase 1 (single API instance).

---

## 10. Load testing checklist

Before cutover:

- [ ] 50 concurrent users browsing master data
- [ ] 10 concurrent document posts (SO + DO + Invoice)
- [ ] Stock position report with 100K SKUs < 5s
- [ ] Daily sales report for 1 month < 3s
- [ ] Connection pool stable under sustained load (no exhaustion)

Tools: k6, NBomber, or Azure Load Testing.

---

## 11. Anti-patterns to avoid

| Anti-pattern | Why bad | Instead |
|--------------|---------|---------|
| Load all invoice lines client-side | Browser crash | Server pagination + aggregates |
| Global doc_num without division | Wrong indexes, collisions | Composite unique |
| Sync over HTTP for reports | Timeout | Async job + poll/download |
| Recalc all stock nightly | 106K+ rows lock | Incremental ledger |
| Missing FK indexes | Seq scans on joins | Index all FKs |

---

## Related

- [database-review.md](../database/database-review.md)
- [security-performance-guide.md](../security-performance-guide.md)
- [architecture/diagrams.md](../architecture/diagrams.md)
