using System.Diagnostics;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Processes;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using IoFile = System.IO.File;
using IoDirectory = System.IO.Directory;
using IoPath = System.IO.Path;
using IoFileInfo = System.IO.FileInfo;

namespace Jaza.Api.Controllers.System;

/// <summary>
/// Period-end batch processes, cancelled-document cleanup, and database backup/restore.
/// See docs/modules/system/prds/period-end-processes.md, delete-cancelled-document.md, backup-restore.md.
/// </summary>
[ApiController]
[Tags("System")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/system")]
public sealed class SystemController(
    AppDbContext db,
    IDivisionScopeService division,
    ICurrentUser currentUser,
    IConfiguration config,
    IWebHostEnvironment env,
    ILogger<SystemController> logger) : ControllerBase
{
    /// <summary>
    /// Closes the fiscal period for the given division/year/month and computes a stock valuation
    /// snapshot. Fails if the period doesn't exist yet or is already closed.
    /// </summary>
    [HttpPost("monthly-process")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<MonthlyProcessResult>> MonthlyProcess([FromBody] MonthlyProcessRequest req, CancellationToken ct)
    {
        division.EnsureDivisionAccess(req.Division);
        var steps = new List<PeriodEndStepDto>();

        var period = await db.FiscalPeriods.FirstOrDefaultAsync(
            f => f.Division == req.Division && f.Year == req.Year && f.Month == req.Month, ct);
        if (period is null)
        {
            steps.Add(new PeriodEndStepDto("fiscal-period", "Fiscal Period", "Failed", "No fiscal period found for this division/year/month. Create it first under Company Preferences."));
            return new MonthlyProcessResult(req.Division, req.Year, req.Month, steps);
        }
        if (period.IsClosed)
        {
            steps.Add(new PeriodEndStepDto("fiscal-period", "Fiscal Period", "Failed", "Period is already closed."));
            return new MonthlyProcessResult(req.Division, req.Year, req.Month, steps);
        }

        var valuation = await db.StockOnHand.AsNoTracking()
            .Where(s => s.Quantity != 0)
            .SumAsync(s => s.Quantity * s.AverageCost, ct);
        steps.Add(new PeriodEndStepDto("stock-valuation", "Stock Valuation", "Done", $"Total on-hand value: {valuation:N0}"));

        var arOutstanding = await db.Invoices.AsNoTracking()
            .Where(i => i.Division == req.Division && (i.Status == InvoiceStatus.Posted || i.Status == InvoiceStatus.PartiallyPaid))
            .SumAsync(i => i.GrandTotal - i.AmountPaid, ct);
        steps.Add(new PeriodEndStepDto("ar-summary", "A/R Monthly Summary", "Done", $"Outstanding A/R: {arOutstanding:N0}"));

        period.IsClosed = true;
        period.ClosedAtUtc = DateTime.UtcNow;
        period.ClosedByUserId = currentUser.UserId;
        await db.SaveChangesAsync(ct);
        steps.Add(new PeriodEndStepDto("close-period", "Close Fiscal Period", "Done", $"{req.Year}-{req.Month:D2} closed."));

        return new MonthlyProcessResult(req.Division, req.Year, req.Month, steps);
    }

    /// <summary>
    /// Read-only daily rollup (idempotent — safe to re-run). Does not mutate any records.
    /// </summary>
    [HttpPost("day-end")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<DayEndProcessResult>> DayEnd([FromBody] DayEndProcessRequest req, CancellationToken ct)
    {
        division.EnsureDivisionAccess(req.Division);
        var dayStart = req.Date.Date;
        var dayEnd = dayStart.AddDays(1);
        var steps = new List<PeriodEndStepDto>();

        var salesCount = await db.SalesOrders.AsNoTracking()
            .CountAsync(s => s.Division == req.Division && s.OrderDate >= dayStart && s.OrderDate < dayEnd, ct);
        var salesTotal = await db.SalesOrders.AsNoTracking()
            .Where(s => s.Division == req.Division && s.OrderDate >= dayStart && s.OrderDate < dayEnd)
            .SumAsync(s => s.GrandTotal, ct);
        steps.Add(new PeriodEndStepDto("daily-sales", "Daily Sales Rollup", "Done", $"{salesCount} orders, total {salesTotal:N0}"));

        var movementCount = await db.StockMovements.AsNoTracking()
            .CountAsync(m => m.OccurredAtUtc >= dayStart && m.OccurredAtUtc < dayEnd, ct);
        steps.Add(new PeriodEndStepDto("daily-movements", "Daily Stock Movement Summary", "Done", $"{movementCount} movements"));

        return new DayEndProcessResult(req.Division, req.Date, steps);
    }

    /// <summary>
    /// Previews (dry run) or permanently deletes voided/cancelled documents of one document type
    /// within a date range. Always audited via the standard SaveChanges pipeline.
    /// </summary>
    [HttpPost("delete-cancelled-document")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<DeleteCancelledDocumentResult>> DeleteCancelledDocument(
        [FromBody] DeleteCancelledDocumentRequest req, CancellationToken ct)
    {
        var div = req.Division ?? division.EffectiveDivision;
        if (div is not null) division.EnsureDivisionAccess(div);

        switch (req.DocumentType.ToUpperInvariant())
        {
            case "SO":
            {
                var q = db.SalesOrders.Where(x => x.Status == DocumentStatus.Voided
                    && x.OrderDate >= req.DateFrom && x.OrderDate <= req.DateTo);
                if (div is not null) q = q.Where(x => x.Division == div);
                var docs = await q.Include(x => x.Lines).ToListAsync(ct);
                var numbers = docs.Select(x => x.Number).ToList();
                if (!req.DryRun)
                {
                    foreach (var d in docs) db.SalesOrderLines.RemoveRange(d.Lines);
                    db.SalesOrders.RemoveRange(docs);
                    await db.SaveChangesAsync(ct);
                }
                return new DeleteCancelledDocumentResult("SO", docs.Count, req.DryRun, numbers);
            }
            case "PO":
            {
                var q = db.PurchaseOrders.Where(x => x.Status == DocumentStatus.Voided
                    && x.OrderDate >= req.DateFrom && x.OrderDate <= req.DateTo);
                if (div is not null) q = q.Where(x => x.Division == div);
                var docs = await q.Include(x => x.Lines).ToListAsync(ct);
                var numbers = docs.Select(x => x.Number).ToList();
                if (!req.DryRun)
                {
                    foreach (var d in docs) db.PurchaseOrderLines.RemoveRange(d.Lines);
                    db.PurchaseOrders.RemoveRange(docs);
                    await db.SaveChangesAsync(ct);
                }
                return new DeleteCancelledDocumentResult("PO", docs.Count, req.DryRun, numbers);
            }
            case "DO":
            {
                var q = db.DeliveryOrders.Where(x => x.Status == DocumentStatus.Voided
                    && x.DeliveredAt >= req.DateFrom && x.DeliveredAt <= req.DateTo);
                if (div is not null) q = q.Where(x => x.Division == div);
                var docs = await q.Include(x => x.Lines).ToListAsync(ct);
                var numbers = docs.Select(x => x.Number).ToList();
                if (!req.DryRun)
                {
                    foreach (var d in docs) db.DeliveryOrderLines.RemoveRange(d.Lines);
                    db.DeliveryOrders.RemoveRange(docs);
                    await db.SaveChangesAsync(ct);
                }
                return new DeleteCancelledDocumentResult("DO", docs.Count, req.DryRun, numbers);
            }
            case "INV":
            {
                var q = db.Invoices.Where(x => x.Status == InvoiceStatus.Voided
                    && x.IssueDate >= req.DateFrom && x.IssueDate <= req.DateTo);
                if (div is not null) q = q.Where(x => x.Division == div);
                var docs = await q.Include(x => x.Lines).ToListAsync(ct);
                var numbers = docs.Select(x => x.Number).ToList();
                if (!req.DryRun)
                {
                    foreach (var d in docs) db.InvoiceLines.RemoveRange(d.Lines);
                    db.Invoices.RemoveRange(docs);
                    await db.SaveChangesAsync(ct);
                }
                return new DeleteCancelledDocumentResult("INV", docs.Count, req.DryRun, numbers);
            }
            default:
                throw new DomainException($"Unsupported document type '{req.DocumentType}'. Use SO, PO, DO, or INV.");
        }
    }

    private string BackupsDirectory
    {
        get
        {
            var dir = IoPath.Combine(env.ContentRootPath, "backups");
            IoDirectory.CreateDirectory(dir);
            return dir;
        }
    }

    /// <summary>Runs `pg_dump` against the configured connection string and saves the dump under `backups/`.</summary>
    [HttpPost("backup")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<ActionResult<BackupJobDto>> Backup(CancellationToken ct)
    {
        var cs = config.GetConnectionString("Default") ?? throw new DomainException("No database connection configured.");
        var b = new NpgsqlConnectionStringBuilder(cs);
        var fileName = $"jaza-{DateTime.UtcNow:yyyyMMdd-HHmmss}.sql";
        var path = IoPath.Combine(BackupsDirectory, fileName);

        var psi = new ProcessStartInfo("pg_dump")
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        psi.ArgumentList.Add($"--host={b.Host}");
        psi.ArgumentList.Add($"--port={b.Port}");
        psi.ArgumentList.Add($"--username={b.Username}");
        psi.ArgumentList.Add($"--dbname={b.Database}");
        psi.ArgumentList.Add("--no-owner");
        psi.ArgumentList.Add("--no-privileges");
        psi.Environment["PGPASSWORD"] = b.Password ?? "";

        try
        {
            using var proc = Process.Start(psi) ?? throw new InvalidOperationException("pg_dump failed to start.");
            await using (var outFile = IoFile.Create(path))
                await proc.StandardOutput.BaseStream.CopyToAsync(outFile, ct);
            var stderr = await proc.StandardError.ReadToEndAsync(ct);
            await proc.WaitForExitAsync(ct);
            if (proc.ExitCode != 0)
            {
                if (IoFile.Exists(path)) IoFile.Delete(path);
                throw new DomainException($"pg_dump exited with code {proc.ExitCode}: {stderr}");
            }
        }
        catch (Exception ex) when (ex is not DomainException)
        {
            logger.LogError(ex, "Backup failed");
            throw new DomainException($"Backup failed: {ex.Message} (is pg_dump installed on this host?)");
        }

        var info = new IoFileInfo(path);
        return new BackupJobDto(fileName, info.Length, DateTime.UtcNow);
    }

    /// <summary>Lists previously created backup files (newest first).</summary>
    [HttpGet("backup/history")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public ActionResult<IReadOnlyList<BackupJobDto>> BackupHistory()
    {
        var files = IoDirectory.GetFiles(BackupsDirectory, "*.sql")
            .Select(f => new IoFileInfo(f))
            .OrderByDescending(f => f.CreationTimeUtc)
            .Select(f => new BackupJobDto(f.Name, f.Length, f.CreationTimeUtc))
            .ToList();
        return files;
    }

    /// <summary>Streams a previously created backup file for download.</summary>
    [HttpGet("backup/{fileName}/download")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public IActionResult DownloadBackup(string fileName)
    {
        var safeName = IoPath.GetFileName(fileName);
        var path = IoPath.Combine(BackupsDirectory, safeName);
        if (!IoFile.Exists(path)) return NotFound();
        return PhysicalFile(path, "application/sql", safeName);
    }

    /// <summary>
    /// Restores the database from an uploaded SQL dump via `psql`. Destructive — SuperAdmin only.
    /// </summary>
    [HttpPost("restore")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    [RequestSizeLimit(1024L * 1024 * 1024)]
    public async Task<ActionResult<RestoreResult>> Restore(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0) throw new DomainException("Uploaded file is empty.");
        var cs = config.GetConnectionString("Default") ?? throw new DomainException("No database connection configured.");
        var b = new NpgsqlConnectionStringBuilder(cs);

        var tempPath = IoPath.Combine(IoPath.GetTempPath(), $"jaza-restore-{Guid.NewGuid():N}.sql");
        await using (var stream = IoFile.Create(tempPath))
            await file.CopyToAsync(stream, ct);

        var psi = new ProcessStartInfo("psql")
        {
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        psi.ArgumentList.Add($"--host={b.Host}");
        psi.ArgumentList.Add($"--port={b.Port}");
        psi.ArgumentList.Add($"--username={b.Username}");
        psi.ArgumentList.Add($"--dbname={b.Database}");
        psi.ArgumentList.Add("--file");
        psi.ArgumentList.Add(tempPath);
        psi.Environment["PGPASSWORD"] = b.Password ?? "";

        try
        {
            using var proc = Process.Start(psi) ?? throw new InvalidOperationException("psql failed to start.");
            var stderr = await proc.StandardError.ReadToEndAsync(ct);
            await proc.WaitForExitAsync(ct);
            if (proc.ExitCode != 0)
                return new RestoreResult(file.FileName, false, stderr);
            return new RestoreResult(file.FileName, true, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Restore failed");
            return new RestoreResult(file.FileName, false, $"{ex.Message} (is psql installed on this host?)");
        }
        finally
        {
            if (IoFile.Exists(tempPath)) IoFile.Delete(tempPath);
        }
    }
}
