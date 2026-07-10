using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Credit;
using Jaza.Application.Outbound;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Outbound;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers.Sales;

[ApiController]
[Tags("Outbound")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/outbound")]
public sealed class OutboundController(AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IStockService stock,
    ICreditControlService credit,
    IStockCommitmentService stockCommitment,
    IValidator<SalesOrderUpsertDto> soVal,
    IValidator<DeliveryOrderUpsertDto> doVal) : ControllerBase
{
    [HttpGet("sales-orders")]
    public async Task<PagedResult<SalesOrderDto>> ListSOs([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.SalesOrders.AsNoTracking()
            .Include(s => s.Customer).Include(s => s.Warehouse).Include(s => s.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(s => s.OrderDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<SalesOrderDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("sales-orders/{id:guid}")]
    public async Task<ActionResult<SalesOrderDto>> GetSO(Guid id, CancellationToken ct)
    {
        var s = await LoadSO(id, ct);
        division.EnsureDivisionAccess(s.Division);
        return Map(s);
    }

    [HttpPost("sales-orders")]
    public async Task<ActionResult<SalesOrderDto>> CreateSO([FromBody] SalesOrderUpsertDto dto, CancellationToken ct)
    {
        await soVal.ValidateAndThrowAsync(dto, ct);
        await EnsureCreditAsync(dto.CustomerId, EstimateOrderTotal(dto.Lines), ct);
        var so = new SalesOrder
        {
            Number = await numberGen.NextAsync("SO", ct),
            Division = division.RequireDivisionForWrite(),
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

    [HttpPut("sales-orders/{id:guid}")]
    public async Task<IActionResult> UpdateSO(Guid id, [FromBody] SalesOrderUpsertDto dto, CancellationToken ct)
    {
        await soVal.ValidateAndThrowAsync(dto, ct);
        var s = await db.SalesOrders.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        if (s.Status != DocumentStatus.Draft) throw new DomainException("Only draft SOs can be updated.");

        s.CustomerId = dto.CustomerId;
        s.WarehouseId = dto.WarehouseId;
        s.OrderDate = dto.OrderDate;
        s.RequestedDate = dto.RequestedDate;
        s.Currency = dto.Currency;
        s.Notes = dto.Notes;
        db.SalesOrderLines.RemoveRange(s.Lines);
        s.Lines = dto.Lines.Select(l => new SalesOrderLine
        {
            LineNumber = l.LineNumber,
            ItemId = l.ItemId,
            Quantity = l.Quantity,
            UnitPrice = l.UnitPrice,
            DiscountPercent = l.DiscountPercent,
            TaxPercent = l.TaxPercent,
        }).ToList();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("sales-orders/{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> PostSO(Guid id, CancellationToken ct)
    {
        var s = await db.SalesOrders.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        if (s.Status != DocumentStatus.Draft) throw new DomainException("Only draft SOs can be posted.");
        s.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await stockCommitment.CommitAsync(id, ct);
        return NoContent();
    }

    /// <summary>Void a posted SO — releases the stock commitment reserved on post (legacy Cancel).</summary>
    [HttpPost("sales-orders/{id:guid}/void")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> VoidSO(Guid id, CancellationToken ct)
    {
        var s = await db.SalesOrders.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        if (s.Status != DocumentStatus.Posted) throw new DomainException("Only posted SOs can be voided.");
        await stockCommitment.ReleaseAsync(id, ct);
        s.Status = DocumentStatus.Voided;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Delete a draft SO outright (legacy F3 Undo on an unsaved/insert-state document).</summary>
    [HttpDelete("sales-orders/{id:guid}")]
    public async Task<IActionResult> DeleteSO(Guid id, CancellationToken ct)
    {
        var s = await db.SalesOrders.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        if (s.Status != DocumentStatus.Draft) throw new DomainException("Only draft SOs can be deleted.");
        db.SalesOrderLines.RemoveRange(s.Lines);
        db.SalesOrders.Remove(s);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("delivery-orders")]
    public async Task<PagedResult<DeliveryOrderDto>> ListDOs([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.DeliveryOrders.AsNoTracking()
            .Include(d => d.Customer).Include(d => d.Warehouse).Include(d => d.SalesOrder)
            .Include(d => d.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(d => d.DeliveredAt);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<DeliveryOrderDto>(items.Select(MapDo).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("delivery-orders/{id:guid}")]
    public async Task<ActionResult<DeliveryOrderDto>> GetDO(Guid id, CancellationToken ct)
    {
        var d = await LoadDO(id, ct);
        division.EnsureDivisionAccess(d.Division);
        return MapDo(d);
    }

    [HttpPost("delivery-orders")]
    public async Task<ActionResult<DeliveryOrderDto>> CreateDO([FromBody] DeliveryOrderUpsertDto dto, CancellationToken ct)
    {
        await doVal.ValidateAndThrowAsync(dto, ct);
        await EnsureCreditAsync(dto.CustomerId, 0m, ct);
        var doc = new DeliveryOrder
        {
            Number = await numberGen.NextAsync("DO", ct),
            Division = division.RequireDivisionForWrite(),
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

    [HttpPut("delivery-orders/{id:guid}")]
    public async Task<IActionResult> UpdateDO(Guid id, [FromBody] DeliveryOrderUpsertDto dto, CancellationToken ct)
    {
        await doVal.ValidateAndThrowAsync(dto, ct);
        var doc = await db.DeliveryOrders.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft DOs can be updated.");

        doc.SalesOrderId = dto.SalesOrderId;
        doc.CustomerId = dto.CustomerId;
        doc.WarehouseId = dto.WarehouseId;
        doc.DeliveredAt = dto.DeliveredAt;
        doc.Notes = dto.Notes;
        db.DeliveryOrderLines.RemoveRange(doc.Lines);
        doc.Lines = dto.Lines.Select(l => new DeliveryOrderLine
        {
            LineNumber = l.LineNumber,
            SalesOrderLineId = l.SalesOrderLineId,
            ItemId = l.ItemId,
            LocationId = l.LocationId,
            Quantity = l.Quantity,
        }).ToList();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Posting a DO is the only way to take stock out of the system.</summary>
    [HttpPost("delivery-orders/{id:guid}/post")]
    public async Task<IActionResult> PostDO(Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.DeliveryOrders.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
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

    /// <summary>Void a posted DO — reverses the goods-issue stock movement (legacy Cancel).</summary>
    [HttpPost("delivery-orders/{id:guid}/void")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> VoidDO(Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.DeliveryOrders.Include(d => d.Lines).FirstOrDefaultAsync(d => d.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Posted) throw new DomainException("Only posted DOs can be voided.");

        foreach (var l in doc.Lines)
        {
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.GoodsReceipt,
                ItemId = l.ItemId,
                WarehouseId = doc.WarehouseId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                OccurredAtUtc = DateTime.UtcNow,
                SourceDocumentType = nameof(DeliveryOrder) + ":Void",
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);

            if (l.SalesOrderLineId is not null)
            {
                var sol = await db.SalesOrderLines.FindAsync([l.SalesOrderLineId.Value], ct);
                if (sol is not null) sol.QuantityDelivered -= l.Quantity;
            }
        }

        doc.Status = DocumentStatus.Voided;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return NoContent();
    }

    private async Task EnsureCreditAsync(Guid customerId, decimal additionalAmount, CancellationToken ct)
    {
        var adminOverride = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin);
        var result = await credit.CheckAsync(customerId, additionalAmount, adminOverride, ct);
        if (!result.Allowed)
            throw new DomainException(result.Reason ?? "Credit check failed.");
    }

    private static decimal EstimateOrderTotal(IReadOnlyList<SalesOrderUpsertLineDto> lines) =>
        lines.Sum(l =>
        {
            var sub = l.Quantity * l.UnitPrice * (1m - l.DiscountPercent / 100m);
            return sub + sub * l.TaxPercent / 100m;
        });

    private async Task<SalesOrder> LoadSO(Guid id, CancellationToken ct) =>
        await db.SalesOrders.AsNoTracking()
            .Include(s => s.Customer).Include(s => s.Warehouse).Include(s => s.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new KeyNotFoundException();

    private async Task<DeliveryOrder> LoadDO(Guid id, CancellationToken ct) =>
        await db.DeliveryOrders.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Warehouse).Include(x => x.SalesOrder)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

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
