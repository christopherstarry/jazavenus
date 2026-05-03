# Database Recommendation — Jaza Venus

Since we're redesigning the database from scratch (the old schema has bad architecture), what should we use?

---

## Short Answer: PostgreSQL  

Switch from SQL Server to **PostgreSQL**. It's free, faster for this workload, and the old SQL Server data can still be migrated via ETL.

---

## Why Not Keep SQL Server?

| Problem | Detail |
|---------|--------|
| **SQL Server Express limit: 10 GB** | A WMS database grows past 10 GB quickly — invoices, stock movements, audit logs |
| **SQL Server Express RAM limit: 1 GB** | Only 1 GB for query cache. Reports on large tables will be slow |
| **SQL Server Standard costs money** | ~$900/year licensing per 2 cores. At 8 cores = ~$3,600/year |
| **Old schema is the problem, not the engine** | Even if we keep SQL Server, we'd redesign the schema anyway |

If we kept SQL Server, we'd need **Standard Edition** ($3,600+/year) just to get past Express limits. That alone makes PostgreSQL worth it.

---

## PostgreSQL vs SQL Server for This WMS

| Factor | PostgreSQL | SQL Server Express | SQL Server Standard |
|--------|-----------|-------------------|-------------------|
| **License cost** | Free | Free | ~$3,600/year |
| **Database size limit** | Unlimited | 10 GB | Unlimited |
| **RAM for cache** | Unlimited (as much as server has) | 1 GB | Unlimited |
| **Query speed (indexed)** | Fast | Fast | Fast |
| **Full-text search** | Built-in | Built-in (limited) | Built-in |
| **JSON support** | Excellent | Good | Good |
| **Geo/spatial** | PostGIS (free) | Built-in | Built-in |
| **Audit logging** | Trigger-based or extension | Trigger-based | Trigger-based |
| **Backup** | pg_dump (free) | Built-in | Built-in |
| **Hosting cost** | Same VPS | Same VPS | Same VPS |
| **Migration from old SQL Server** | Via ETL tool (Jaza.Migration) | Direct restore | Direct restore |

---

## What About Migration from Old SQL Server?

Using PostgreSQL does NOT prevent migration. The process:

```
Old SQL Server (legacy schema)
        │
        ▼
   ETL Tool (Jaza.Migration)
   Reads old tables → transforms → writes to new PostgreSQL schema
        │
        ▼
   New PostgreSQL (clean schema)
```

The `Jaza.Migration` project already exists in the codebase (`backend/src/Jaza.Migration/`). It reads from the old database and writes to the new one. We just change the output target from SQL Server to PostgreSQL.

**Data older than 5 years** gets archived during ETL (as required in the BRD).

---

## Can EF Core Handle PostgreSQL?

Yes. EF Core supports PostgreSQL via **Npgsql** — a mature, Microsoft-blessed provider.

What changes in code:
```
- Microsoft.EntityFrameworkCore.SqlServer
+ Npgsql.EntityFrameworkCore.PostgreSQL

# Connection string changes from:
# Server=sqlserver;Database=JazaVenus;...
# to:
# Host=postgres;Database=jaza_venus;...
```

Everything else — LINQ queries, migrations, `DbContext` — stays the same.

---

## Query Speed: What Actually Matters

For a WMS with 35-50 users, the database engine matters less than **schema design** and **indexing**.

| What makes queries fast | Impact |
|-------------------------|--------|
| **Proper indexes** on every FK, search column, sort column | 🔥🔥🔥🔥🔥 Critical |
| **Pagination** — never load full tables | 🔥🔥🔥🔥🔥 Critical |
| **Only SELECT needed columns** (no `SELECT *`) | 🔥🔥🔥🔥 High |
| **Avoid N+1 queries** (use `.Include()`) | 🔥🔥🔥🔥 High |
| **Connection pooling** (enabled by default in Npgsql) | 🔥🔥🔥 Medium |
| **Database engine choice** (PostgreSQL vs SQL Server) | 🔥🔥 Small difference when both are properly indexed |

A well-indexed PostgreSQL beats a poorly-indexed SQL Server Standard every time. The old schema is the real bottleneck.

---

## Recommended Tech Stack for Database

| Component | Choice | Why |
|-----------|--------|-----|
| **Database** | PostgreSQL 17 | Free, fast, no size limits, great for mixed OLTP + reporting |
| **ORM** | EF Core + Npgsql | Same code patterns, just swap provider |
| **Migrations** | EF Core Migrations | Already in codebase |
| **Full-text search** | PostgreSQL `tsvector` | For search across customers, products, invoices |
| **Audit tables** | PostgreSQL triggers | Append-only audit log per table |
| **Backups** | `pg_dump` nightly + WAL archiving | Point-in-time recovery |
| **Hosting** | Docker container on same VPS | Same as current `docker-compose.yml` pattern |

---

## Docker Compose Change

Current:
```yaml
sqlserver:
  image: mcr.microsoft.com/mssql/server:2022-latest
```

New:
```yaml
postgres:
  image: postgres:17-alpine
  environment:
    POSTGRES_DB: jaza_venus
    POSTGRES_USER: jaza_app
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  ports:
    - "127.0.0.1:5432:5432"
  volumes:
    - pgdata:/var/lib/postgresql/data
```

PostgreSQL Alpine image is **80 MB** vs SQL Server's **1.5 GB**. Faster startup, less RAM usage.

---

## Recommendation Summary

| Question | Answer |
|----------|--------|
| What database? | **PostgreSQL 17** |
| Can old SQL Server data be migrated? | Yes — via `Jaza.Migration` ETL tool (already exists) |
| Will queries be faster? | Yes — no Express limits, better indexing, full cache use |
| What about EF Core? | Just swap NuGet package (Npgsql), connection string changes |
| Cost? | Free. No licensing. Same $36/month VPS. |
| Migration risk? | Low. ETL is a one-time operation. Test it multiple times before go-live. |
