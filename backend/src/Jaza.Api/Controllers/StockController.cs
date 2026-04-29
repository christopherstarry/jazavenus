using Jaza.Application.Common;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/stock")]
public sealed class StockController(AppDbContext db, IStockService stock) : ControllerBase
{
    public sealed record OnHandRow(Guid ItemId, string Sku, string Name, Guid WarehouseId,
        string WarehouseCode, Guid? LocationId, string? LocationCode, decimal Quantity, decimal AverageCost);

    [HttpGet("on-hand")]
    public async Task<PagedResult<OnHandRow>> OnHand([FromQuery] PagedRequest q,
        [FromQuery] Guid? warehouseId, [FromQuery] Guid? itemId, CancellationToken ct)
    {
        var canSeeCost = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin);
        var src = db.StockOnHand.AsNoTracking()
            .Include(s => s.Item).Include(s => s.Warehouse).Include(s => s.Location).AsQueryable();
        if (warehouseId is not null) src = src.Where(s => s.WarehouseId == warehouseId);
        if (itemId is not null) src = src.Where(s => s.ItemId == itemId);

        var total = await src.CountAsync(ct);
        var rows = await src.OrderBy(s => s.Item!.Sku)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(s => new OnHandRow(
                s.ItemId, s.Item!.Sku, s.Item.Name,
                s.WarehouseId, s.Warehouse!.Code,
                s.LocationId, s.Location!.Code,
                s.Quantity, canSeeCost ? s.AverageCost : 0m))
            .ToListAsync(ct);
        return new PagedResult<OnHandRow>(rows, total, q.Page, q.PageSize);
    }

    public sealed record AdjustmentDto(Guid ItemId, Guid WarehouseId, Guid? LocationId,
        decimal Quantity, decimal UnitCost, string Reason);

    [HttpPost("adjustments")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Adjust([FromBody] AdjustmentDto dto, CancellationToken ct)
    {
        if (dto.Quantity == 0) throw new DomainException("Adjustment quantity cannot be zero.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await stock.PostMovementAsync(new StockMovement
        {
            Type = dto.Quantity > 0 ? StockMovementType.AdjustmentIn : StockMovementType.AdjustmentOut,
            ItemId = dto.ItemId, WarehouseId = dto.WarehouseId, LocationId = dto.LocationId,
            Quantity = dto.Quantity, UnitCost = dto.UnitCost,
            OccurredAtUtc = DateTime.UtcNow,
            SourceDocumentType = "Adjustment", SourceDocumentId = Guid.CreateVersion7(),
            Notes = dto.Reason,
        }, ct);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return NoContent();
    }
}
