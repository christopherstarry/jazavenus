using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/reports")]
public sealed class ReportsController(AppDbContext db) : ControllerBase
{
    public sealed record StockCardRow(DateTime OccurredAtUtc, string Type, string Document,
        decimal Quantity, decimal RunningBalance, decimal UnitCost);

    [HttpGet("stock-card")]
    public async Task<ActionResult<IReadOnlyList<StockCardRow>>> StockCard(
        [FromQuery] Guid itemId, [FromQuery] Guid warehouseId, [FromQuery] DateTime? from, [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var q = db.StockMovements.AsNoTracking()
            .Where(m => m.ItemId == itemId && m.WarehouseId == warehouseId);
        if (from.HasValue) q = q.Where(m => m.OccurredAtUtc >= from);
        if (to.HasValue) q = q.Where(m => m.OccurredAtUtc <= to);

        var rows = await q.OrderBy(m => m.OccurredAtUtc).ThenBy(m => m.Id)
            .Select(m => new { m.OccurredAtUtc, Type = m.Type.ToString(), Document = m.SourceDocumentNumber ?? "", m.Quantity, m.UnitCost })
            .ToListAsync(ct);

        var running = 0m;
        var result = rows.Select(r =>
        {
            running += r.Quantity;
            return new StockCardRow(r.OccurredAtUtc, r.Type, r.Document, r.Quantity, running, r.UnitCost);
        }).ToList();
        return result;
    }

    public sealed record LowStockRow(Guid ItemId, string Sku, string Name, decimal OnHand, decimal? ReorderLevel);

    [HttpGet("low-stock")]
    public async Task<IReadOnlyList<LowStockRow>> LowStock(CancellationToken ct)
    {
        var grouped = await db.StockOnHand.AsNoTracking()
            .GroupBy(s => s.ItemId)
            .Select(g => new { ItemId = g.Key, OnHand = g.Sum(x => x.Quantity) })
            .ToListAsync(ct);
        var ids = grouped.Select(g => g.ItemId).ToList();
        var items = await db.Items.AsNoTracking().Where(i => ids.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, ct);

        return grouped
            .Where(g => items[g.ItemId].ReorderLevel.HasValue && g.OnHand <= items[g.ItemId].ReorderLevel)
            .Select(g => new LowStockRow(g.ItemId, items[g.ItemId].Sku, items[g.ItemId].Name, g.OnHand, items[g.ItemId].ReorderLevel))
            .OrderBy(x => x.Sku).ToList();
    }

    public sealed record DailyMovementRow(DateOnly Date, decimal InQty, decimal OutQty);

    [HttpGet("daily-movements")]
    public async Task<IReadOnlyList<DailyMovementRow>> DailyMovements(
        [FromQuery] DateTime from, [FromQuery] DateTime to, [FromQuery] Guid? warehouseId, CancellationToken ct)
    {
        var q = db.StockMovements.AsNoTracking()
            .Where(m => m.OccurredAtUtc >= from && m.OccurredAtUtc <= to);
        if (warehouseId is not null) q = q.Where(m => m.WarehouseId == warehouseId);

        var rows = await q.GroupBy(m => m.OccurredAtUtc.Date)
            .Select(g => new
            {
                Date = g.Key,
                InQty = g.Where(x => x.Quantity > 0).Sum(x => x.Quantity),
                OutQty = -g.Where(x => x.Quantity < 0).Sum(x => x.Quantity),
            })
            .OrderBy(x => x.Date)
            .ToListAsync(ct);

        return rows.Select(r => new DailyMovementRow(DateOnly.FromDateTime(r.Date), r.InQty, r.OutQty)).ToList();
    }

    public sealed record FinancialSummary(decimal TotalARDue, decimal RevenueMTD, decimal RevenueYTD,
        int OpenInvoices, int OverdueInvoices);

    [HttpGet("financial-summary")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<FinancialSummary> Financial(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearStart = new DateTime(today.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var mtd = await db.Invoices.AsNoTracking()
            .Where(i => i.IssueDate >= monthStart && i.Status != Domain.Invoicing.InvoiceStatus.Voided)
            .Include(i => i.Lines).ToListAsync(ct);
        var ytd = await db.Invoices.AsNoTracking()
            .Where(i => i.IssueDate >= yearStart && i.Status != Domain.Invoicing.InvoiceStatus.Voided)
            .Include(i => i.Lines).ToListAsync(ct);
        var open = await db.Invoices.AsNoTracking()
            .Where(i => i.Status == Domain.Invoicing.InvoiceStatus.Posted
                     || i.Status == Domain.Invoicing.InvoiceStatus.PartiallyPaid)
            .Include(i => i.Lines).Include(i => i.Payments).ToListAsync(ct);

        return new FinancialSummary(
            TotalARDue: open.Sum(i => i.AmountDue),
            RevenueMTD: mtd.Sum(i => i.GrandTotal),
            RevenueYTD: ytd.Sum(i => i.GrandTotal),
            OpenInvoices: open.Count,
            OverdueInvoices: open.Count(i => i.DueDate < today));
    }
}
