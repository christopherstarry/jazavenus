using Jaza.Application.Lookup;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Lookup;

public sealed class LookupService(AppDbContext db, IDivisionScopeService divisionScope) : ILookupService
{
    private static readonly string[] Types =
    [
        "customers", "suppliers", "items", "warehouses", "brands", "categories", "sub-categories",
        "units", "banks", "salesmen", "collectors", "areas", "payment-terms", "outlet-types",
        "group-outlets", "trade-types", "sub-trade-types", "distribution-types", "class-outlets",
        "cost-types", "manufacturers", "tax-registrations", "price-tiers", "discount-codes",
        "order-codes", "return-codes", "extra-discounts", "purchase-orders", "sales-orders",
        "delivery-orders", "invoices", "payments", "sales-returns", "purchase-returns",
        "credit-memos", "post-dated-checks", "stock-receipts", "stock-issues", "stock-transfers",
        "locations", "item-prices", "item-discounts", "customer-addresses", "warehouse-types",
        "outlet-group-types", "fiscal-periods", "company-settings",
    ];

    public IReadOnlyList<string> SupportedTypes => Types;

    public async Task<LookupResult> SearchAsync(string type, string? search, string? division, int page, int pageSize,
        CancellationToken ct = default)
    {
        var normalized = type.Trim().ToLowerInvariant();
        if (!Types.Contains(normalized))
            throw new DomainException($"Unknown lookup type: {type}");

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        var skip = (page - 1) * pageSize;

        return normalized switch
        {
            "customers" => await SearchCustomers(search, skip, pageSize, ct),
            "suppliers" => await SearchSuppliers(search, skip, pageSize, ct),
            "items" => await SearchItems(search, skip, pageSize, ct),
            "warehouses" => await SearchWarehouses(search, skip, pageSize, ct),
            "brands" => await SearchBrands(search, skip, pageSize, ct),
            "categories" => await SearchCategories(search, skip, pageSize, ct),
            "units" => await SearchUnits(search, skip, pageSize, ct),
            "banks" => await SearchBanks(search, skip, pageSize, ct),
            "salesmen" => await SearchSalesmen(search, skip, pageSize, ct),
            "collectors" => await SearchCollectors(search, skip, pageSize, ct),
            "areas" => await SearchAreas(search, skip, pageSize, ct),
            "order-codes" => await SearchOrderCodes(search, skip, pageSize, ct),
            "return-codes" => await SearchReturnCodes(search, skip, pageSize, ct),
            "purchase-orders" => await SearchPurchaseOrders(search, division, skip, pageSize, ct),
            "sales-orders" => await SearchSalesOrders(search, division, skip, pageSize, ct),
            "delivery-orders" => await SearchDeliveryOrders(search, division, skip, pageSize, ct),
            "invoices" => await SearchInvoices(search, division, skip, pageSize, ct),
            _ => new LookupResult(normalized, [], 0),
        };
    }

    private async Task<LookupResult> SearchCustomers(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Customers.AsNoTracking().Where(c => c.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(c => c.Code.Contains(search) || c.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(c => c.Code).Skip(skip).Take(take)
            .Select(c => new LookupItem(c.Id, c.Code, c.Name, c.City)).ToListAsync(ct);
        return new LookupResult("customers", rows, total);
    }

    private async Task<LookupResult> SearchSuppliers(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Suppliers.AsNoTracking().Where(s => s.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(s => s.Code.Contains(search) || s.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(s => s.Code).Skip(skip).Take(take)
            .Select(s => new LookupItem(s.Id, s.Code, s.Name, null)).ToListAsync(ct);
        return new LookupResult("suppliers", rows, total);
    }

    private async Task<LookupResult> SearchItems(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Items.AsNoTracking().Where(i => i.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(i => i.Sku.Contains(search) || i.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(i => i.Sku).Skip(skip).Take(take)
            .Select(i => new LookupItem(i.Id, i.Sku, i.Name, i.Barcode)).ToListAsync(ct);
        return new LookupResult("items", rows, total);
    }

    private async Task<LookupResult> SearchWarehouses(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Warehouses.AsNoTracking().Where(w => w.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(w => w.Code.Contains(search) || w.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(w => w.Code).Skip(skip).Take(take)
            .Select(w => new LookupItem(w.Id, w.Code, w.Name, null)).ToListAsync(ct);
        return new LookupResult("warehouses", rows, total);
    }

    private async Task<LookupResult> SearchBrands(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Brands.AsNoTracking().Where(b => b.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(b => b.Code.Contains(search) || b.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(b => b.Code).Skip(skip).Take(take)
            .Select(b => new LookupItem(b.Id, b.Code, b.Name, null)).ToListAsync(ct);
        return new LookupResult("brands", rows, total);
    }

    private async Task<LookupResult> SearchCategories(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Categories.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(c => c.Code.Contains(search) || c.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(c => c.Code).Skip(skip).Take(take)
            .Select(c => new LookupItem(c.Id, c.Code, c.Name, null)).ToListAsync(ct);
        return new LookupResult("categories", rows, total);
    }

    private async Task<LookupResult> SearchUnits(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Units.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(u => u.Code.Contains(search) || u.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(u => u.Code).Skip(skip).Take(take)
            .Select(u => new LookupItem(u.Id, u.Code, u.Name, null)).ToListAsync(ct);
        return new LookupResult("units", rows, total);
    }

    private async Task<LookupResult> SearchBanks(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Banks.AsNoTracking().Where(b => b.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(b => b.Code.Contains(search) || b.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(b => b.Code).Skip(skip).Take(take)
            .Select(b => new LookupItem(b.Id, b.Code, b.Name, null)).ToListAsync(ct);
        return new LookupResult("banks", rows, total);
    }

    private async Task<LookupResult> SearchSalesmen(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Salesmen.AsNoTracking().Where(s => s.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(s => s.Code.Contains(search) || s.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(s => s.Code).Skip(skip).Take(take)
            .Select(s => new LookupItem(s.Id, s.Code, s.Name, null)).ToListAsync(ct);
        return new LookupResult("salesmen", rows, total);
    }

    private async Task<LookupResult> SearchCollectors(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Collectors.AsNoTracking().Where(c => c.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(c => c.Code.Contains(search) || c.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(c => c.Code).Skip(skip).Take(take)
            .Select(c => new LookupItem(c.Id, c.Code, c.Name, null)).ToListAsync(ct);
        return new LookupResult("collectors", rows, total);
    }

    private async Task<LookupResult> SearchAreas(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.Areas.AsNoTracking().Where(a => a.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(a => a.Code.Contains(search) || a.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(a => a.Code).Skip(skip).Take(take)
            .Select(a => new LookupItem(a.Id, a.Code, a.Name, null)).ToListAsync(ct);
        return new LookupResult("areas", rows, total);
    }

    private async Task<LookupResult> SearchOrderCodes(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.OrderCodes.AsNoTracking().Where(o => o.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(o => o.Code.Contains(search) || o.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(o => o.Code).Skip(skip).Take(take)
            .Select(o => new LookupItem(o.Id, o.Code, o.Name, o.Description)).ToListAsync(ct);
        return new LookupResult("order-codes", rows, total);
    }

    private async Task<LookupResult> SearchReturnCodes(string? search, int skip, int take, CancellationToken ct)
    {
        var q = db.ReturnCodes.AsNoTracking().Where(r => r.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(r => r.Code.Contains(search) || r.Name.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(r => r.Code).Skip(skip).Take(take)
            .Select(r => new LookupItem(r.Id, r.Code, r.Name, r.Description)).ToListAsync(ct);
        return new LookupResult("return-codes", rows, total);
    }

    private async Task<LookupResult> SearchPurchaseOrders(string? search, string? division, int skip, int take, CancellationToken ct)
    {
        var q = db.PurchaseOrders.AsNoTracking();
        var div = division ?? divisionScope.EffectiveDivision;
        if (div is not null) q = q.Where(p => p.Division == div);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(p => p.Number.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(p => p.OrderDate).Skip(skip).Take(take)
            .Select(p => new LookupItem(p.Id, p.Number, p.Status.ToString(), p.OrderDate.ToString("yyyy-MM-dd"))).ToListAsync(ct);
        return new LookupResult("purchase-orders", rows, total);
    }

    private async Task<LookupResult> SearchSalesOrders(string? search, string? division, int skip, int take, CancellationToken ct)
    {
        var q = db.SalesOrders.AsNoTracking();
        var div = division ?? divisionScope.EffectiveDivision;
        if (div is not null) q = q.Where(s => s.Division == div);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(s => s.Number.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(s => s.OrderDate).Skip(skip).Take(take)
            .Select(s => new LookupItem(s.Id, s.Number, s.Status.ToString(), s.OrderDate.ToString("yyyy-MM-dd"))).ToListAsync(ct);
        return new LookupResult("sales-orders", rows, total);
    }

    private async Task<LookupResult> SearchDeliveryOrders(string? search, string? division, int skip, int take, CancellationToken ct)
    {
        var q = db.DeliveryOrders.AsNoTracking();
        var div = division ?? divisionScope.EffectiveDivision;
        if (div is not null) q = q.Where(d => d.Division == div);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(d => d.Number.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(d => d.DeliveredAt).Skip(skip).Take(take)
            .Select(d => new LookupItem(d.Id, d.Number, d.Status.ToString(), d.DeliveredAt.ToString("yyyy-MM-dd"))).ToListAsync(ct);
        return new LookupResult("delivery-orders", rows, total);
    }

    private async Task<LookupResult> SearchInvoices(string? search, string? division, int skip, int take, CancellationToken ct)
    {
        var q = db.Invoices.AsNoTracking();
        var div = division ?? divisionScope.EffectiveDivision;
        if (div is not null) q = q.Where(i => i.Division == div);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(i => i.Number.Contains(search));
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(i => i.IssueDate).Skip(skip).Take(take)
            .Select(i => new LookupItem(i.Id, i.Number, i.Status.ToString(), i.IssueDate.ToString("yyyy-MM-dd"))).ToListAsync(ct);
        return new LookupResult("invoices", rows, total);
    }
}
