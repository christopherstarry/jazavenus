using Jaza.Application.Reports;
using Jaza.Domain.Common;
using Jaza.Domain.Inventory;
using Jaza.Domain.Stock;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Reports;

public sealed partial class ReportQueryService
{
    private async Task<ReportQueryResult> ExecuteInventoryAsync(ReportQueryContext ctx, string key, CancellationToken ct) =>
        key switch
        {
            "inventory-process" => await InventoryProcess(ctx, ct),
            "stock-position" => await InventoryStockPosition(ctx, ct),
            "stock-mutation" => await InventoryStockMutation(ctx, ct),
            "product-price-list" => await InventoryPriceList(ctx, ct),
            "sku-stock" => await InventorySkuStock(ctx, ct),
            "stock-opname" => await InventoryStockOpname(ctx, ct),
            "bpb-report" => await InventoryBpb(ctx, ct),
            "bbk-report" => await InventoryBbk(ctx, ct),
            "transfer-report" => await InventoryTransfer(ctx, ct),
            "stock-card" => await InventoryStockCard(ctx, ct),
            "combined-stock" => await InventoryCombinedStock(ctx, ct),
            "monthly-trial" => await InventoryMonthlyTrial(ctx, ct),
            "consignment-stock" => await InventoryConsignmentStock(ctx, ct),
            "stock-valuation" => await InventoryStockValuation(ctx, ct),
            "slow-moving" => await InventorySlowMoving(ctx, ct),
            "fast-moving" => await InventoryFastMoving(ctx, ct),
            "location-stock" => await InventoryLocationStock(ctx, ct),
            "warehouse-summary" => await InventoryWarehouseSummary(ctx, ct),
            "negative-stock" => await InventoryNegativeStock(ctx, ct),
            "reorder-suggestion" => await InventoryReorderSuggestion(ctx, ct),
            "goods-receipt-register" => await InventoryGrnRegister(ctx, ct),
            "goods-issue-register" => await InventoryDoRegister(ctx, ct),
            "movement-summary" => await InventoryMovementSummary(ctx, ct),
            "expiry-tracking" => await InventoryExpiryTracking(ctx, ct),
            "stock-aging" => await InventoryStockAging(ctx, ct),
            _ => throw new DomainException($"Unknown inventory report: {key}"),
        };

    private IQueryable<StockOnHand> StockOnHandQuery(ReportQueryContext ctx)
    {
        var q = ctx.Db.StockOnHand.AsNoTracking();
        if (ctx.ItemId.HasValue) q = q.Where(s => s.ItemId == ctx.ItemId);
        if (ctx.WarehouseId.HasValue) q = q.Where(s => s.WarehouseId == ctx.WarehouseId);
        return q;
    }

    private async Task<ReportQueryResult> InventoryProcess(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.AuditLogs.AsNoTracking()
            .Where(a => a.Entity.Contains("Stock") || a.Entity.Contains("Inventory"));
        if (ctx.From.HasValue) q = q.Where(a => a.OccurredAtUtc >= ctx.From.Value);
        if (ctx.To.HasValue) q = q.Where(a => a.OccurredAtUtc <= ctx.To.Value);
        var ordered = q.OrderByDescending(a => a.OccurredAtUtc);
        return await ctx.PageAsync(ordered, a => ReportQueryContext.Row(
            ("occurredAt", a.OccurredAtUtc), ("entity", a.Entity), ("action", a.Action),
            ("entityId", a.EntityId)), ct);
    }

    private async Task<ReportQueryResult> InventoryStockPosition(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                join w in ctx.Db.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                orderby i.Sku
                select new { i.Sku, i.Name, w.Code, s.Quantity, s.CommittedQuantity, s.AverageCost };
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("warehouseCode", x.Code), ("onHand", x.Quantity),
            ("committed", x.CommittedQuantity), ("available", x.Quantity - x.CommittedQuantity),
            ("averageCost", x.AverageCost)), ct);
    }

    private async Task<ReportQueryResult> InventoryStockMutation(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.StockMovements.AsNoTracking().AsQueryable();
        if (ctx.From.HasValue) q = q.Where(m => m.OccurredAtUtc >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(m => m.OccurredAtUtc <= ctx.To);
        if (ctx.ItemId.HasValue) q = q.Where(m => m.ItemId == ctx.ItemId);
        if (ctx.WarehouseId.HasValue) q = q.Where(m => m.WarehouseId == ctx.WarehouseId);
        q = q.OrderByDescending(m => m.OccurredAtUtc);
        return await ctx.PageAsync(q, m => ReportQueryContext.Row(
            ("occurredAt", m.OccurredAtUtc), ("type", m.Type.ToString()), ("document", m.SourceDocumentNumber),
            ("quantity", m.Quantity), ("unitCost", m.UnitCost)), ct);
    }

    private async Task<ReportQueryResult> InventoryPriceList(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from p in ctx.Db.ItemPrices.AsNoTracking()
                join i in ctx.Db.Items.AsNoTracking() on p.ItemId equals i.Id
                join t in ctx.Db.PriceTiers.AsNoTracking() on p.PriceTierId equals t.Id
                where p.IsActive && i.IsActive
                orderby i.Sku, t.Code
                select new { i.Sku, i.Name, t.Code, p.Price };
        if (ctx.ItemId.HasValue) q = q.Where(x => ctx.Db.Items.Any(i => i.Id == ctx.ItemId && i.Sku == x.Sku));
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("priceTier", x.Code), ("price", x.Price)), ct);
    }

    private async Task<ReportQueryResult> InventorySkuStock(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                group s by new { i.Sku, i.Name, i.ReorderLevel } into g
                select new
                {
                    g.Key.Sku, g.Key.Name, g.Key.ReorderLevel,
                    OnHand = g.Sum(x => x.Quantity),
                };
        return await ctx.PageAsync(q.OrderBy(x => x.Sku), x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("onHand", x.OnHand),
            ("reorderLevel", x.ReorderLevel), ("belowReorder", x.ReorderLevel.HasValue && x.OnHand <= x.ReorderLevel)), ct);
    }

    private async Task<ReportQueryResult> InventoryStockOpname(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.StockTakeSessions.AsNoTracking().Where(s => !s.IsDeleted), s => s.Division);
        if (ctx.WarehouseId.HasValue) q = q.Where(s => s.WarehouseId == ctx.WarehouseId);
        q = q.Include(s => s.Warehouse).Include(s => s.Lines).OrderByDescending(s => s.SessionDate);
        return await ctx.PageAsync(q, s => ReportQueryContext.Row(
            ("sessionNumber", s.Number), ("sessionDate", s.SessionDate), ("warehouseCode", s.Warehouse!.Code),
            ("status", s.Status.ToString()), ("lineCount", s.Lines.Count),
            ("totalVariance", s.Lines.Sum(l => l.Variance))), ct);
    }

    private async Task<ReportQueryResult> InventoryBpb(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.GoodsReceiptNotes.AsNoTracking().Where(g => !g.IsDeleted && g.Status == DocumentStatus.Posted), g => g.Division);
        if (ctx.From.HasValue) q = q.Where(g => g.ReceivedAt >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(g => g.ReceivedAt <= ctx.To);
        if (ctx.SupplierId.HasValue) q = q.Where(g => g.SupplierId == ctx.SupplierId);
        q = q.Include(g => g.Supplier).OrderByDescending(g => g.ReceivedAt);
        return await ctx.PageAsync(q, g => ReportQueryContext.Row(
            ("grnNumber", g.Number), ("receivedAt", g.ReceivedAt), ("supplierCode", g.Supplier!.Code),
            ("lineCount", g.Lines.Count)), ct);
    }

    private async Task<ReportQueryResult> InventoryBbk(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.StockIssues.AsNoTracking().Where(s => !s.IsDeleted && s.Status == DocumentStatus.Posted), s => s.Division);
        if (ctx.From.HasValue) q = q.Where(s => s.IssueDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(s => s.IssueDate <= ctx.To);
        if (ctx.WarehouseId.HasValue) q = q.Where(s => s.WarehouseId == ctx.WarehouseId);
        q = q.Include(s => s.Warehouse).OrderByDescending(s => s.IssueDate);
        return await ctx.PageAsync(q, s => ReportQueryContext.Row(
            ("issueNumber", s.Number), ("issueDate", s.IssueDate), ("warehouseCode", s.Warehouse!.Code),
            ("reasonCode", s.ReasonCode), ("lineCount", s.Lines.Count)), ct);
    }

    private async Task<ReportQueryResult> InventoryTransfer(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.StockTransfers.AsNoTracking().Where(t => !t.IsDeleted && t.Status == DocumentStatus.Posted), t => t.Division);
        if (ctx.From.HasValue) q = q.Where(t => t.TransferDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(t => t.TransferDate <= ctx.To);
        q = q.Include(t => t.FromWarehouse).Include(t => t.ToWarehouse).OrderByDescending(t => t.TransferDate);
        return await ctx.PageAsync(q, t => ReportQueryContext.Row(
            ("transferNumber", t.Number), ("transferDate", t.TransferDate),
            ("fromWarehouse", t.FromWarehouse!.Code), ("toWarehouse", t.ToWarehouse!.Code),
            ("lineCount", t.Lines.Count)), ct);
    }

    private async Task<ReportQueryResult> InventoryStockCard(ReportQueryContext ctx, CancellationToken ct)
    {
        if (!ctx.ItemId.HasValue || !ctx.WarehouseId.HasValue)
            throw new DomainException("stock-card requires itemId and warehouseId query parameters.");

        var q = ctx.Db.StockMovements.AsNoTracking()
            .Where(m => m.ItemId == ctx.ItemId && m.WarehouseId == ctx.WarehouseId);
        if (ctx.From.HasValue) q = q.Where(m => m.OccurredAtUtc >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(m => m.OccurredAtUtc <= ctx.To);
        var rows = await q.OrderBy(m => m.OccurredAtUtc).ThenBy(m => m.Id).ToListAsync(ct);
        var running = 0m;
        var result = rows.Select(m =>
        {
            running += m.Quantity;
            return ReportQueryContext.Row(
                ("occurredAt", m.OccurredAtUtc), ("type", m.Type.ToString()),
                ("document", m.SourceDocumentNumber), ("quantity", m.Quantity),
                ("runningBalance", running), ("unitCost", m.UnitCost));
        }).ToList();
        return ctx.Result(result, result.Count);
    }

    private async Task<ReportQueryResult> InventoryCombinedStock(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                group s by new { i.Sku, i.Name } into g
                select new { g.Key.Sku, g.Key.Name, TotalQty = g.Sum(x => x.Quantity), TotalValue = g.Sum(x => x.Quantity * x.AverageCost) };
        return await ctx.PageAsync(q.OrderBy(x => x.Sku), x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("totalQty", x.TotalQty), ("totalValue", x.TotalValue)), ct);
    }

    private async Task<ReportQueryResult> InventoryMonthlyTrial(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.StockMovements.AsNoTracking();
        if (ctx.From.HasValue) q = q.Where(m => m.OccurredAtUtc >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(m => m.OccurredAtUtc <= ctx.To);
        var grouped = await q.GroupBy(m => new { m.OccurredAtUtc.Year, m.OccurredAtUtc.Month })
            .Select(g => new
            {
                g.Key.Year, g.Key.Month,
                InQty = g.Where(x => x.Quantity > 0).Sum(x => x.Quantity),
                OutQty = -g.Where(x => x.Quantity < 0).Sum(x => x.Quantity),
            }).OrderBy(x => x.Year).ThenBy(x => x.Month).ToListAsync(ct);
        return ctx.Result(grouped.Select(x => ReportQueryContext.Row(
            ("year", x.Year), ("month", x.Month), ("inQty", x.InQty), ("outQty", x.OutQty))).ToList(), grouped.Count);
    }

    private async Task<ReportQueryResult> InventoryConsignmentStock(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join w in ctx.Db.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                where w.Code.Contains("CONSIGN", StringComparison.OrdinalIgnoreCase)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                select new { i.Sku, i.Name, w.Code, s.Quantity };
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("warehouseCode", x.Code), ("quantity", x.Quantity)), ct);
    }

    private async Task<ReportQueryResult> InventoryStockValuation(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                join w in ctx.Db.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                select new { i.Sku, w.Code, Value = s.Quantity * s.AverageCost };
        var total = await q.SumAsync(x => (decimal?)x.Value, ct) ?? 0m;
        var rows = await q.Skip(ctx.Skip).Take(ctx.PageSize).ToListAsync(ct);
        var result = rows.Select(x => ReportQueryContext.Row(
            ("sku", x.Sku), ("warehouseCode", x.Code), ("value", x.Value))).ToList();
        result.Add(ReportQueryContext.Row(("sku", "TOTAL"), ("warehouseCode", ""), ("value", total)));
        return ctx.Result(result, rows.Count + 1);
    }

    private async Task<ReportQueryResult> InventorySlowMoving(ReportQueryContext ctx, CancellationToken ct)
    {
        var cutoff = ctx.To ?? DateTime.UtcNow.AddDays(-90);
        var moved = ctx.Db.StockMovements.AsNoTracking()
            .Where(m => m.OccurredAtUtc >= cutoff && m.Quantity < 0)
            .Select(m => m.ItemId).Distinct();
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                where s.Quantity > 0 && !moved.Contains(s.ItemId)
                select new { i.Sku, i.Name, s.Quantity, s.LastMovementAtUtc };
        return await ctx.PageAsync(q.OrderBy(x => x.LastMovementAtUtc), x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("onHand", x.Quantity),
            ("lastMovementAt", x.LastMovementAtUtc)), ct);
    }

    private async Task<ReportQueryResult> InventoryFastMoving(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.StockMovements.AsNoTracking();
        if (ctx.From.HasValue) q = q.Where(m => m.OccurredAtUtc >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(m => m.OccurredAtUtc <= ctx.To);
        var grouped = q.Where(m => m.Quantity < 0).GroupBy(m => m.ItemId)
            .Select(g => new { ItemId = g.Key, OutQty = -g.Sum(x => x.Quantity) })
            .OrderByDescending(x => x.OutQty);
        return await ctx.PageAsync(grouped, x => ReportQueryContext.Row(
            ("itemId", x.ItemId), ("outQty", x.OutQty)), ct);
    }

    private async Task<ReportQueryResult> InventoryLocationStock(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                join l in ctx.Db.Locations.AsNoTracking() on s.LocationId equals l.Id into locs
                from l in locs.DefaultIfEmpty()
                select new { i.Sku, LocationCode = l != null ? l.Code : "", s.Quantity };
        return await ctx.PageAsync(q.OrderBy(x => x.Sku), x => ReportQueryContext.Row(
            ("sku", x.Sku), ("locationCode", x.LocationCode), ("quantity", x.Quantity)), ct);
    }

    private async Task<ReportQueryResult> InventoryWarehouseSummary(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join w in ctx.Db.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                group s by new { w.Code, w.Name } into g
                select new { g.Key.Code, g.Key.Name, SkuCount = g.Count(), TotalQty = g.Sum(x => x.Quantity) };
        return await ctx.PageAsync(q.OrderBy(x => x.Code), x => ReportQueryContext.Row(
            ("warehouseCode", x.Code), ("warehouseName", x.Name), ("skuCount", x.SkuCount),
            ("totalQty", x.TotalQty)), ct);
    }

    private async Task<ReportQueryResult> InventoryNegativeStock(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx).Where(s => s.Quantity < 0)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                join w in ctx.Db.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                select new { i.Sku, w.Code, s.Quantity };
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("sku", x.Sku), ("warehouseCode", x.Code), ("quantity", x.Quantity)), ct);
    }

    private async Task<ReportQueryResult> InventoryReorderSuggestion(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from s in StockOnHandQuery(ctx)
                join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                where i.ReorderLevel.HasValue && s.Quantity <= i.ReorderLevel
                select new { i.Sku, i.Name, s.Quantity, i.ReorderLevel, i.ReorderQuantity };
        return await ctx.PageAsync(q.OrderBy(x => x.Sku), x => ReportQueryContext.Row(
            ("sku", x.Sku), ("itemName", x.Name), ("onHand", x.Quantity),
            ("reorderLevel", x.ReorderLevel), ("suggestedOrderQty", x.ReorderQuantity ?? x.ReorderLevel)), ct);
    }

    private async Task<ReportQueryResult> InventoryGrnRegister(ReportQueryContext ctx, CancellationToken ct) =>
        await InventoryBpb(ctx, ct);

    private async Task<ReportQueryResult> InventoryDoRegister(ReportQueryContext ctx, CancellationToken ct) =>
        await InventoryBbk(ctx, ct);

    private async Task<ReportQueryResult> InventoryMovementSummary(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.StockMovements.AsNoTracking();
        if (ctx.From.HasValue) q = q.Where(m => m.OccurredAtUtc >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(m => m.OccurredAtUtc <= ctx.To);
        var grouped = await q.GroupBy(m => m.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count(), NetQty = g.Sum(x => x.Quantity) })
            .ToListAsync(ct);
        return ctx.Result(grouped.Select(x => ReportQueryContext.Row(
            ("movementType", x.Type), ("count", x.Count), ("netQty", x.NetQty))).ToList(), grouped.Count);
    }

    private async Task<ReportQueryResult> InventoryExpiryTracking(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.GoodsReceiptLines.AsNoTracking()
                join g in ctx.Db.GoodsReceiptNotes.AsNoTracking() on l.GoodsReceiptNoteId equals g.Id
                where !l.IsDeleted && l.ExpiryDate != null
                orderby l.ExpiryDate
                select new { g.Number, l.LineNumber, l.ExpiryDate, l.Quantity, l.ItemId };
        if (ctx.From.HasValue) q = q.Where(x => x.ExpiryDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(x => x.ExpiryDate <= ctx.To);
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("grnNumber", x.Number), ("lineNumber", x.LineNumber), ("expiryDate", x.ExpiryDate),
            ("quantity", x.Quantity), ("itemId", x.ItemId)), ct);
    }

    private async Task<ReportQueryResult> InventoryStockAging(ReportQueryContext ctx, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var items = await (from s in StockOnHandQuery(ctx).Where(s => s.Quantity > 0)
                           join i in ctx.Db.Items.AsNoTracking() on s.ItemId equals i.Id
                           select new { i.Sku, s.Quantity, s.LastMovementAtUtc }).ToListAsync(ct);
        var projected = items
            .Select(x => new
            {
                x.Sku,
                x.Quantity,
                x.LastMovementAtUtc,
                DaysSinceMove = (today - x.LastMovementAtUtc.Date).Days,
            })
            .OrderByDescending(x => x.DaysSinceMove)
            .ToList();
        var page = projected.Skip(ctx.Skip).Take(ctx.PageSize).ToList();
        return ctx.Result(page.Select(x => ReportQueryContext.Row(
            ("sku", x.Sku), ("quantity", x.Quantity), ("lastMovementAt", x.LastMovementAtUtc),
            ("daysSinceMovement", x.DaysSinceMove))).ToList(), projected.Count);
    }
}
