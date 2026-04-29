using System.Text.Json;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Jaza.Migration;

/// <summary>
/// One-off ETL runner: legacy SQL Server -> new schema.
/// Each entity migration is a discrete method so they can be re-run individually with --only=.
/// Every batch is wrapped in a transaction; --dry-run prints what would happen without writing.
/// </summary>
public sealed class EtlRunner(EtlOptions opts, ILogger<EtlRunner> log)
{
    public async Task RunAsync()
    {
        Validate();
        Directory.CreateDirectory(opts.ErrorsDirectory);
        log.LogInformation("ETL starting. DryRun={DryRun} Only=[{Only}] Since={Since}",
            opts.DryRun, string.Join(",", opts.Only), opts.Since);

        var optsB = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(opts.TargetConnectionString).Options;
        await using var target = new AppDbContext(optsB);

        var report = new Dictionary<string, MigrationReport>();
        foreach (var entity in opts.Only)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var r = entity.ToLowerInvariant() switch
            {
                "units"      => await MigrateUnitsAsync(target),
                "categories" => await MigrateCategoriesAsync(target),
                "suppliers"  => await MigrateSuppliersAsync(target),
                "customers"  => await MigrateCustomersAsync(target),
                "warehouses" => await MigrateWarehousesAsync(target),
                "items"      => await MigrateItemsAsync(target),
                _ => new MigrationReport(entity, 0, 0, 0, [$"Unknown entity '{entity}' — add a method in EtlRunner."])
            };
            sw.Stop();
            report[entity] = r;
            log.LogInformation("{Entity}: read={Read} written={Written} skipped={Skipped} errors={Errors} ({Ms} ms)",
                r.Entity, r.Read, r.Written, r.Skipped, r.Errors.Count, sw.ElapsedMilliseconds);
            await DumpErrorsAsync(r);
        }

        await File.WriteAllTextAsync(Path.Combine(opts.ErrorsDirectory, "summary.json"),
            JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
        log.LogInformation("ETL complete.");
    }

    private void Validate()
    {
        if (string.IsNullOrWhiteSpace(opts.LegacyConnectionString))
            throw new InvalidOperationException("Legacy connection string missing. Pass --legacy-cs=... or set Etl:LegacyConnectionString in config.");
        if (string.IsNullOrWhiteSpace(opts.TargetConnectionString))
            throw new InvalidOperationException("Target connection string missing.");
    }

    /// <summary>Reads from a CSV-like SqlDataReader and yields rows as dictionaries (very tolerant).</summary>
    private async IAsyncEnumerable<Dictionary<string, object?>> ReadLegacyAsync(string sql,
        Action<SqlCommand>? configure = null)
    {
        await using var cn = new SqlConnection(opts.LegacyConnectionString);
        await cn.OpenAsync();
        await using var cmd = cn.CreateCommand();
        cmd.CommandText = sql;
        configure?.Invoke(cmd);
        await using var reader = await cmd.ExecuteReaderAsync();
        var cols = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToArray();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>(cols.Length, StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < cols.Length; i++)
                row[cols[i]] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            yield return row;
        }
    }

    // ---------- Per-entity migrations ----------
    // NOTE: column names below are placeholders. Update them once you have docs/legacy-schema.txt
    // and the docs/schema-mapping.md table is filled in.

    private async Task<MigrationReport> MigrateUnitsAsync(AppDbContext target)
    {
        var report = new MigrationReport("Units");
        var existing = await target.Units.AsNoTracking().ToDictionaryAsync(u => u.Code);
        await foreach (var row in ReadLegacyAsync("SELECT UoMCode, UoMName FROM dbo.LegacyUoM"))
        {
            report.Read++;
            try
            {
                var code = row["UoMCode"]?.ToString()?.Trim().ToUpperInvariant();
                var name = row["UoMName"]?.ToString()?.Trim();
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name))
                { report.Errors.Add($"Empty UoM row: {JsonSerializer.Serialize(row)}"); continue; }
                if (existing.ContainsKey(code)) { report.Skipped++; continue; }

                if (!opts.DryRun)
                    target.Units.Add(new Unit { Code = code, Name = name });
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add($"{ex.Message}: {JsonSerializer.Serialize(row)}"); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private Task<MigrationReport> MigrateCategoriesAsync(AppDbContext _) =>
        Task.FromResult(new MigrationReport("Categories", 0, 0, 0, ["TODO: implement once docs/schema-mapping.md is filled in"]));

    private Task<MigrationReport> MigrateSuppliersAsync(AppDbContext _) =>
        Task.FromResult(new MigrationReport("Suppliers", 0, 0, 0, ["TODO: implement"]));

    private Task<MigrationReport> MigrateCustomersAsync(AppDbContext _) =>
        Task.FromResult(new MigrationReport("Customers", 0, 0, 0, ["TODO: implement"]));

    private Task<MigrationReport> MigrateWarehousesAsync(AppDbContext _) =>
        Task.FromResult(new MigrationReport("Warehouses", 0, 0, 0, ["TODO: implement"]));

    private Task<MigrationReport> MigrateItemsAsync(AppDbContext _) =>
        Task.FromResult(new MigrationReport("Items", 0, 0, 0, ["TODO: implement"]));

    private async Task DumpErrorsAsync(MigrationReport r)
    {
        if (r.Errors.Count == 0) return;
        var path = Path.Combine(opts.ErrorsDirectory, $"{r.Entity.ToLowerInvariant()}.errors.txt");
        await File.WriteAllLinesAsync(path, r.Errors);
    }
}

public sealed class MigrationReport(string entity, int read = 0, int written = 0, int skipped = 0, List<string>? errors = null)
{
    public string Entity { get; } = entity;
    public int Read { get; set; } = read;
    public int Written { get; set; } = written;
    public int Skipped { get; set; } = skipped;
    public List<string> Errors { get; set; } = errors ?? [];
}
