using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Stock;

public sealed class StockService(AppDbContext db) : IStockService
{
    public async Task PostMovementAsync(StockMovement movement, CancellationToken ct = default)
    {
        db.StockMovements.Add(movement);

        var soh = await db.StockOnHand
            .FirstOrDefaultAsync(s => s.ItemId == movement.ItemId
                                   && s.WarehouseId == movement.WarehouseId
                                   && s.LocationId == movement.LocationId, ct);

        if (soh is null)
        {
            if (movement.Quantity < 0)
                throw new DomainException("Cannot issue stock that does not exist (no on-hand row).");

            soh = new StockOnHand
            {
                ItemId = movement.ItemId,
                WarehouseId = movement.WarehouseId,
                LocationId = movement.LocationId,
                Quantity = movement.Quantity,
                AverageCost = movement.UnitCost,
                LastMovementAtUtc = movement.OccurredAtUtc,
            };
            db.StockOnHand.Add(soh);
            return;
        }

        var newQty = soh.Quantity + movement.Quantity;
        if (newQty < 0)
            throw new DomainException(
                $"Insufficient stock for item {movement.ItemId} in warehouse {movement.WarehouseId}: " +
                $"on hand {soh.Quantity}, requested {-movement.Quantity}.");

        if (movement.Quantity > 0)
        {
            // Weighted-average cost recalc on inbound.
            var totalValue = soh.Quantity * soh.AverageCost + movement.Quantity * movement.UnitCost;
            soh.AverageCost = newQty == 0 ? 0 : totalValue / newQty;
        }
        soh.Quantity = newQty;
        soh.LastMovementAtUtc = movement.OccurredAtUtc;
    }

    public async Task<decimal> GetOnHandAsync(Guid itemId, Guid warehouseId, Guid? locationId = null, CancellationToken ct = default)
    {
        var q = db.StockOnHand.AsNoTracking()
            .Where(s => s.ItemId == itemId && s.WarehouseId == warehouseId);
        if (locationId is not null) q = q.Where(s => s.LocationId == locationId);
        return await q.SumAsync(s => (decimal?)s.Quantity, ct) ?? 0m;
    }

    public async Task<decimal> GetAverageCostAsync(Guid itemId, Guid warehouseId, Guid? locationId = null, CancellationToken ct = default)
    {
        var soh = await db.StockOnHand.AsNoTracking()
            .Where(s => s.ItemId == itemId && s.WarehouseId == warehouseId
                     && (locationId == null || s.LocationId == locationId))
            .FirstOrDefaultAsync(ct);
        return soh?.AverageCost ?? 0m;
    }
}
