using Jaza.Application.Common;
using Jaza.Application.Reports;
using Jaza.Domain.Common;
using Jaza.Domain.Inbound;
using Jaza.Domain.Invoicing;
using Jaza.Domain.Outbound;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Reports;

internal sealed class ReportQueryContext
{
    private readonly IDivisionScopeService _divisionScope;

    public ReportQueryContext(AppDbContext db, IDivisionScopeService divisionScope, ReportQueryRequest request)
    {
        Db = db;
        _divisionScope = divisionScope;
        Request = request;
        Page = Math.Max(1, request.Page);
        PageSize = Math.Clamp(request.PageSize, 1, 500);
    }

    public AppDbContext Db { get; }
    public ReportQueryRequest Request { get; }

    public string ReportKey => Request.ReportKey;
    public DateTime? From => Request.From;
    public DateTime? To => Request.To;
    public Guid? CustomerId => Request.CustomerId;
    public Guid? SupplierId => Request.SupplierId;
    public Guid? ItemId => Request.ItemId;
    public Guid? WarehouseId => Request.WarehouseId;

    public int Page { get; }
    public int PageSize { get; }
    public int Skip => (Page - 1) * PageSize;

    public string? Division =>
        !string.IsNullOrWhiteSpace(Request.Division) && Divisions.IsValid(Request.Division)
            ? Divisions.Normalize(Request.Division)
            : _divisionScope.EffectiveDivision;

    public IQueryable<Invoice> Invoices(bool postedOnly = true)
    {
        var q = Db.Invoices.AsNoTracking().Where(i => !i.IsDeleted);
        if (postedOnly)
            q = q.Where(i => i.Status != InvoiceStatus.Voided && i.Status != InvoiceStatus.Draft);
        q = ApplyDivision(q, i => i.Division);
        if (From.HasValue) q = q.Where(i => i.IssueDate >= From.Value);
        if (To.HasValue) q = q.Where(i => i.IssueDate <= To.Value);
        if (CustomerId.HasValue) q = q.Where(i => i.CustomerId == CustomerId.Value);
        return q;
    }

    public IQueryable<SalesOrder> SalesOrders(bool postedOnly = true)
    {
        var q = Db.SalesOrders.AsNoTracking().Where(s => !s.IsDeleted);
        if (postedOnly) q = q.Where(s => s.Status == DocumentStatus.Posted);
        q = ApplyDivision(q, s => s.Division);
        if (From.HasValue) q = q.Where(s => s.OrderDate >= From.Value);
        if (To.HasValue) q = q.Where(s => s.OrderDate <= To.Value);
        if (CustomerId.HasValue) q = q.Where(s => s.CustomerId == CustomerId.Value);
        if (WarehouseId.HasValue) q = q.Where(s => s.WarehouseId == WarehouseId.Value);
        return q;
    }

    public IQueryable<DeliveryOrder> DeliveryOrders(bool postedOnly = true)
    {
        var q = Db.DeliveryOrders.AsNoTracking().Where(d => !d.IsDeleted);
        if (postedOnly) q = q.Where(d => d.Status == DocumentStatus.Posted);
        q = ApplyDivision(q, d => d.Division);
        if (From.HasValue) q = q.Where(d => d.DeliveredAt >= From.Value);
        if (To.HasValue) q = q.Where(d => d.DeliveredAt <= To.Value);
        if (CustomerId.HasValue) q = q.Where(d => d.CustomerId == CustomerId.Value);
        if (WarehouseId.HasValue) q = q.Where(d => d.WarehouseId == WarehouseId.Value);
        return q;
    }

    public IQueryable<PurchaseOrder> PurchaseOrders(bool postedOnly = true)
    {
        var q = Db.PurchaseOrders.AsNoTracking().Where(p => !p.IsDeleted);
        if (postedOnly) q = q.Where(p => p.Status == DocumentStatus.Posted);
        q = ApplyDivision(q, p => p.Division);
        if (From.HasValue) q = q.Where(p => p.OrderDate >= From.Value);
        if (To.HasValue) q = q.Where(p => p.OrderDate <= To.Value);
        if (SupplierId.HasValue) q = q.Where(p => p.SupplierId == SupplierId.Value);
        if (WarehouseId.HasValue) q = q.Where(p => p.WarehouseId == WarehouseId.Value);
        return q;
    }

    public IQueryable<T> ApplyDivision<T>(IQueryable<T> query, Func<T, string> divisionSelector)
        where T : class
    {
        if (Division is null) return query;
        return query.Where(e => divisionSelector(e) == Division);
    }

    public static ReportRow Row(params (string Key, object? Value)[] columns) =>
        new(columns.ToDictionary(c => c.Key, c => c.Value));

    public ReportQueryResult Result(IReadOnlyList<ReportRow> rows, int totalCount) =>
        new(ReportKey, rows, totalCount, Page, PageSize);

    public async Task<ReportQueryResult> PageAsync<T>(
        IQueryable<T> source,
        Func<T, ReportRow> projector,
        CancellationToken ct)
    {
        var total = await source.CountAsync(ct);
        var items = await source.Skip(Skip).Take(PageSize).ToListAsync(ct);
        return Result(items.Select(projector).ToList(), total);
    }
}
