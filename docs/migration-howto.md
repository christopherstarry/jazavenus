# How to run the legacy → new data migration

The migration tool is a separate console app: [`backend/src/Jaza.Migration`](../backend/src/Jaza.Migration). It connects to **two** databases (legacy read-only, new read-write) and copies data per entity, with a dry-run mode and per-row error capture.

## 1. Snapshot legacy data (never touch production)

On the legacy SQL Server:

```sql
BACKUP DATABASE [LegacyWMS] TO DISK = 'C:\backups\legacy-snapshot.bak' WITH COPY_ONLY, COMPRESSION;
```

Restore that `.bak` to a separate development SQL Server instance (e.g. the dev Docker container) under the name `LegacyWMS_Snapshot`.

## 2. Fill in the schema mapping

Open [`docs/schema-mapping.md`](schema-mapping.md). For each legacy table, fill in the source-column → target-column mapping. Then update the corresponding `Migrate*Async` method in [`EtlRunner.cs`](../backend/src/Jaza.Migration/EtlRunner.cs) — the `Units` method is a fully-worked example to copy from.

Use these helpers already provided:

- `ReadLegacyAsync(sql, configure?)` — yields rows as `Dictionary<string, object?>`.
- The `MigrationReport` collects `Read/Written/Skipped/Errors` so the summary file shows real numbers.

## 3. Dry-run

```powershell
cd backend
dotnet run --project src/Jaza.Migration -- `
  --legacy-cs="Server=localhost;Database=LegacyWMS_Snapshot;User Id=sa;Password=ChangeMe!Dev2026;TrustServerCertificate=True" `
  --target-cs="Server=localhost;Database=JazaVenus_Migration;User Id=sa;Password=ChangeMe!Dev2026;TrustServerCertificate=True" `
  --dry-run `
  --only=Units,Categories,Suppliers,Customers,Warehouses,Items
```

Output goes to:

- Console (Serilog).
- `etl-errors/<entity>.errors.txt` — per-entity row-level errors (CSV-able).
- `etl-errors/summary.json` — totals per entity.

## 4. Wet run (commits to target DB)

Drop `--dry-run`. Add `--since=YYYY-MM-DD` for incremental delta runs during the parallel-run period.

## 5. Reconciliation

After the wet run, on the new database:

```sql
-- Spot-check a few entities
SELECT 'Items',     COUNT(*) FROM Items     WHERE IsDeleted = 0
UNION ALL SELECT 'Suppliers', COUNT(*) FROM Suppliers WHERE IsDeleted = 0
UNION ALL SELECT 'Customers', COUNT(*) FROM Customers WHERE IsDeleted = 0;
```

Compare to the legacy `etl-errors/summary.json` and to the original `docs/legacy-schema.txt` row counts.

For money values (later phases — POs, Invoices, Payments) compare `SUM(GrandTotal)` against the legacy report totals; tolerance ±0.01.

## 6. Parallel run (1–2 weeks)

- Wife and team work in the **new** system.
- Old system stays available read-only as a fallback.
- Every night, run a delta: `--since=$(yesterday)`.
- Track every "I had to fall back to the old app" incident in `docs/migration-incidents.md`.

## 7. Cutover

When parallel-run yields zero incidents for 5 business days:

1. Stop the legacy app.
2. Run a final full migration (no `--since`).
3. Run reconciliation again.
4. Re-enable the new system; legacy server set read-only and kept for one year.
