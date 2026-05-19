using Jaza.Application.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireSuperAdmin)]
[Route("api/audit-logs")]
public sealed class AuditLogsController(AppDbContext db) : ControllerBase
{
    private static readonly Dictionary<string, string> EntityDisplayNames = new()
    {
        ["Customer"] = "customer",
        ["CustomerAddress"] = "customer_address",
        ["Item"] = "product",
        ["ItemPrice"] = "product_price",
        ["ItemDiscount"] = "product_discount",
        ["Supplier"] = "supplier",
        ["Brand"] = "brand",
        ["Category"] = "category",
        ["SubCategory"] = "sub_category",
        ["Manufacturing"] = "manufacturer",
        ["Salesman"] = "salesman",
        ["Collector"] = "collector",
        ["Area"] = "area",
        ["Warehouse"] = "warehouse",
        ["WarehouseType"] = "warehouse_type",
        ["Bank"] = "bank",
        ["PaymentTerm"] = "payment_term",
        ["TaxNo"] = "tax_registration",
        ["TradeType"] = "trade_type",
        ["SubTradeType"] = "sub_trade_type",
        ["DistributionType"] = "distribution_type",
        ["OutletType"] = "outlet_type",
        ["GroupOutlet"] = "outlet_group",
        ["GroupOutletType"] = "outlet_group_type",
        ["Price"] = "price_tier",
        ["Discount"] = "discount_code",
        ["Uom"] = "unit_of_measure",
        ["CostType"] = "cost_type",
        ["SalesOrder"] = "sales_order",
        ["DeliveryOrder"] = "delivery",
        ["Invoice"] = "invoice",
        ["PurchaseOrder"] = "purchase_order",
        ["GoodsReceiptNote"] = "goods_receipt",
        ["Payment"] = "payment",
        ["StockMovement"] = "stock_movement",
        ["User"] = "user",
        ["AppUser"] = "user",
        ["Role"] = "role",
        ["AppRole"] = "role",
    };

    [HttpGet]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> List(
        [FromQuery] string? entity,
        [FromQuery] Guid? entityId,
        [FromQuery] string? action,
        [FromQuery] Guid? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var paged = new PagedRequest(page, pageSize).Normalized();

        IQueryable<Domain.Audit.AuditLog> q = db.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entity))
        {
            var rawName = EntityRawName(entity);
            if (rawName != null) q = q.Where(a => a.Entity == rawName);
        }
        if (entityId.HasValue)
            q = q.Where(a => a.EntityId == entityId.Value);
        if (!string.IsNullOrWhiteSpace(action))
            q = q.Where(a => a.Action == action);
        else
            q = q.Where(a => a.Action == "Create" || a.Action == "Update" || a.Action == "Delete");
        if (userId.HasValue)
            q = q.Where(a => a.UserId == userId.Value);
        if (from.HasValue)
        {
            var fromUtc = DateTime.SpecifyKind(from.Value, DateTimeKind.Utc);
            q = q.Where(a => a.OccurredAtUtc >= fromUtc);
        }
        if (to.HasValue)
        {
            var toUtc = DateTime.SpecifyKind(to.Value.Date.AddDays(1), DateTimeKind.Utc);
            q = q.Where(a => a.OccurredAtUtc < toUtc);
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(a => a.OccurredAtUtc)
            .Skip((paged.Page - 1) * paged.PageSize)
            .Take(paged.PageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.UserId,
                a.UserName ?? "(unknown)",
                a.Action,
                EntityDisplayName(a.Entity),
                a.EntityId,
                a.Notes ?? "",
                a.OccurredAtUtc,
                a.IpAddress,
                a.BeforeJson,
                a.AfterJson))
            .ToListAsync();

        return new PagedResult<AuditLogDto>(items, total, paged.Page, paged.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuditLogDto>> Get(Guid id)
    {
        var log = await db.AuditLogs.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        if (log is null) return NotFound();

        return new AuditLogDto(
            log.Id, log.UserId, log.UserName ?? "(unknown)",
            log.Action, EntityDisplayName(log.Entity), log.EntityId,
            log.Notes ?? "", log.OccurredAtUtc, log.IpAddress,
            log.BeforeJson, log.AfterJson);
    }

    private static string EntityDisplayName(string raw) =>
        EntityDisplayNames.TryGetValue(raw, out var name) ? name : raw.ToLowerInvariant();

    private static string? EntityRawName(string display) =>
        EntityDisplayNames.FirstOrDefault(x => x.Value == display).Key;
}

public sealed record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string UserName,
    string Action,
    string Entity,
    Guid? EntityId,
    string Notes,
    DateTime OccurredAtUtc,
    string? IpAddress,
    string? BeforeJson,
    string? AfterJson);
