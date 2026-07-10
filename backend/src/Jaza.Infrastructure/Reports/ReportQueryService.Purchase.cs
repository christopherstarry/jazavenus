using Jaza.Application.Reports;
using Jaza.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Reports;

public sealed partial class ReportQueryService
{
    private async Task<ReportQueryResult> ExecutePurchaseAsync(ReportQueryContext ctx, string key, CancellationToken ct) =>
        key switch
        {
            "purchase-report" => await PurchaseSummary(ctx, ct),
            "purchase-bonus" => await PurchaseBonus(ctx, ct),
            "daily-purchase" => await PurchaseDaily(ctx, ct),
            "purchase-service-level" => await PurchaseServiceLevel(ctx, ct),
            "purchase-recapitulation" => await PurchaseRecapitulation(ctx, ct),
            "purchase-return-register" => await PurchaseReturnRegister(ctx, ct),
            _ => throw new DomainException($"Unknown purchase report: {key}"),
        };

    private async Task<ReportQueryResult> PurchaseSummary(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.PurchaseOrders().Include(p => p.Supplier).OrderByDescending(p => p.OrderDate);
        return await ctx.PageAsync(q, p => ReportQueryContext.Row(
            ("poNumber", p.Number), ("orderDate", p.OrderDate), ("supplierCode", p.Supplier!.Code),
            ("status", p.Status.ToString()), ("subTotal", p.SubTotal), ("grandTotal", p.GrandTotal)), ct);
    }

    private async Task<ReportQueryResult> PurchaseBonus(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.PurchaseOrderLines.AsNoTracking()
                join p in ctx.PurchaseOrders() on l.PurchaseOrderId equals p.Id
                where !l.IsDeleted && l.DiscountPercent > 0
                group l by l.DiscountPercent into g
                select new { DiscountPercent = g.Key, LineCount = g.Count(), Value = g.Sum(x => x.Quantity * x.UnitPrice * x.DiscountPercent / 100m) };
        var list = await q.OrderByDescending(x => x.Value).ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("discountPercent", x.DiscountPercent), ("lineCount", x.LineCount), ("bonusValue", x.Value))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> PurchaseDaily(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.PurchaseOrders().GroupBy(p => p.OrderDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count(), Amount = g.Sum(x => x.GrandTotal) })
            .OrderBy(x => x.Date);
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("date", x.Date), ("poCount", x.Count), ("amount", x.Amount))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> PurchaseServiceLevel(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.PurchaseOrderLines.AsNoTracking()
                join p in ctx.PurchaseOrders() on l.PurchaseOrderId equals p.Id
                where !l.IsDeleted && l.Quantity > 0
                group l by p.Number into g
                select new
                {
                    PoNumber = g.Key,
                    Ordered = g.Sum(x => x.Quantity),
                    Received = g.Sum(x => x.QuantityReceived),
                };
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("poNumber", x.PoNumber), ("orderedQty", x.Ordered), ("receivedQty", x.Received),
            ("serviceLevelPercent", x.Ordered > 0 ? x.Received / x.Ordered * 100m : 0m))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> PurchaseRecapitulation(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.PurchaseOrders().GroupBy(p => new { p.SupplierId, p.Supplier!.Code, p.Supplier.Name })
            .Select(g => new
            {
                g.Key.SupplierId, g.Key.Code, g.Key.Name,
                PoCount = g.Count(), Amount = g.Sum(x => x.GrandTotal),
            }).OrderByDescending(x => x.Amount);
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("supplierCode", x.Code), ("supplierName", x.Name), ("poCount", x.PoCount),
            ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> PurchaseReturnRegister(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.PurchaseReturns.AsNoTracking().Where(r => !r.IsDeleted), r => r.Division);
        if (ctx.From.HasValue) q = q.Where(r => r.ReturnDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(r => r.ReturnDate <= ctx.To);
        if (ctx.SupplierId.HasValue) q = q.Where(r => r.SupplierId == ctx.SupplierId);
        q = q.Include(r => r.Supplier).OrderByDescending(r => r.ReturnDate);
        return await ctx.PageAsync(q, r => ReportQueryContext.Row(
            ("returnNumber", r.Number), ("returnDate", r.ReturnDate), ("supplierCode", r.Supplier!.Code),
            ("status", r.Status.ToString()), ("lineCount", r.Lines.Count)), ct);
    }
}
