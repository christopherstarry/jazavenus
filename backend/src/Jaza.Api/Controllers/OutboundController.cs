using FluentValidation;
using Jaza.Application.Common;
using Jaza.Application.Outbound;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Outbound;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/outbound")]
public sealed class OutboundController(AppDbContext db,
    IDocumentNumberGenerator numberGen,
    IStockService stock,
    IValidator<SalesOrderUpsertDto> soVal,
    IValidator<DeliveryOrderUpsertDto> doVal) : ControllerBase
{
    [HttpGet("sales-orders")]
    public async Task<PagedResult<SalesOrderDto>> ListSOs([FromQuery] PagedRequest q, CancellationToken ct)
    {
        var src = db.SalesOrders.AsNoTracking()
            .Include(s => s.Customer).Include(s => s.Warehouse).Include(s => s.Lines).ThenInclude(l => l.Item)
            .OrderByDescending(s => s.OrderDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<SalesOrderDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("sales-orders/{id:guid}")]
    public async Task<ActionResult<SalesOrderDto>> GetSO(Guid id, CancellationToken ct)
    {
        var s = await db.SalesOrders.AsNoTracking()
            .Include(s => s.Customer).Include(s => s.Warehouse).Include(s => s.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new KeyNotFoundException();
        return Map(s);
    }

    [HttpPost("sales-orders")]
    public async Task<ActionResult<SalesOrderDto>> CreateSO([FromBody] SalesOrderUpsertDto dto, CancellationToken ct)
    {
        await soVal.ValidateAndThrowAsync(dto, ct);
        var so = new SalesOrder
        {
            Number = await numberGen.NextAsync("SO", ct),
            CustomerId = dto.CustomerId,
            WarehouseId = dto.WarehouseId,
            OrderDate = dto.OrderDate,
            RequestedDate = dto.RequestedDate,
            Currency = dto.Currency,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new SalesOrderLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                DiscountPercent = l.DiscountPercent,
                TaxPercent = l.TaxPercent,
            }).ToList(),
        };
        db.SalesOrders.Add(so);
        await db.SaveChangesAsync(ct);
        return await GetSO(so.Id, ct);
    }

    [HttpPost("sales-orders/{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> PostSO(Guid id, CancellationToken ct)
    {
        var s = await db.SalesOrders.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        if (s.Status != DocumentStatus.Draft) throw new DomainException("Only draft SOs can be posted.");
        s.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("delivery-orders")]
    public async Task<PagedResult<DeliveryOrderDto>> ListDOs([FromQuery] PagedRequest q, CancellationToken ct)
    {
        var src = db.DeliveryOrders.AsNoTracking()
            .Include(d => d.Customer).Include(d => d.Warehouse).Include(d => d.SalesOrder)
            .Include(d => d.Lines).ThenInclude(l => l.Item)
            .OrderByDescending(d => d.DeliveredAt);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<DeliveryOrderDto>(items.Select(MapDo).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("delivery-orders/{id:guid}")]
    public async Task<ActionResult<DeliveryOrderDto>> GetDO(Guid id, CancellationToken ct)
    {
        var d = await db.DeliveryOrders.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Warehouse).Include(x => x.SalesOrder)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        return MapDo(d);
    }

    [HttpPost("delivery-orders")]
    public async Task<ActionResult<DeliveryOrderDto>> CreateDO([FromBody] DeliveryOrderUpsertDto dto, CancellationToken ct)
    {
        await doVal.ValidateAndThrowAsync(dto, ct);
        var doc = new DeliveryOrder
        {
            Number = await numberGen.NextAsync("DO", ct),
            SalesOrderId = dto.SalesOrderId,
            CustomerId = dto.CustomerId,
            WarehouseId = dto.WarehouseId,
            DeliveredAt = dto.DeliveredAt,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new DeliveryOrderLine
            {
                LineNumber = l.LineNumber,
                SalesOrderLineId = l.SalesOrderLineId,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
            }).ToList(),
        };
        db.DeliveryOrders.Add(doc);
        await db.SaveChangesAsync(ct);
        return await GetDO(doc.Id, ct);
    }

    /// <summary>Posting a DO is the only way to take stock out of the system.</summary>
    [HttpPost("delivery-orders/{id:guid}/post")]
    public async Task<IActionResult> PostDO(Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.DeliveryOrders.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("DO already posted.");

        foreach (var l in doc.Lines)
        {
            var avgCost = await stock.GetAverageCostAsync(l.ItemId, doc.WarehouseId, l.LocationId, ct);
            l.UnitCost = avgCost;

            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.GoodsIssue,
                ItemId = l.ItemId,
                WarehouseId = doc.WarehouseId,
                LocationId = l.LocationId,
                Quantity = -l.Quantity,
                UnitCost = avgCost,
                OccurredAtUtc = doc.DeliveredAt.ToUniversalTime(),
                SourceDocumentType = nameof(DeliveryOrder),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);

            if (l.SalesOrderLineId is not null)
            {
                var sol = await db.SalesOrderLines.FindAsync([l.SalesOrderLineId.Value], ct);
                if (sol is not null) sol.QuantityDelivered += l.Quantity;
            }
        }

        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return NoContent();
    }

    private static SalesOrderDto Map(SalesOrder s) => new(
        s.Id, s.Number, s.Status,
        s.CustomerId, s.Customer?.Name, s.WarehouseId, s.Warehouse?.Code,
        s.OrderDate, s.RequestedDate, s.Currency, s.Notes,
        s.SubTotal, s.TaxTotal, s.GrandTotal,
        s.Lines.Select(l => new SalesOrderLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.Quantity, l.UnitPrice, l.DiscountPercent, l.TaxPercent,
            l.QuantityDelivered, l.QuantityOpen)).ToList());

    private static DeliveryOrderDto MapDo(DeliveryOrder d) => new(
        d.Id, d.Number, d.Status,
        d.SalesOrderId, d.SalesOrder?.Number,
        d.CustomerId, d.Customer?.Name, d.WarehouseId, d.Warehouse?.Code,
        d.DeliveredAt, d.Notes,
        d.Lines.Select(l => new DeliveryOrderLineDto(
            l.Id, l.LineNumber, l.SalesOrderLineId, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.LocationId, l.Quantity, l.UnitCost)).ToList());
}
