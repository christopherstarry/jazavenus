using Jaza.Application.Common;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Outbound;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Stock;

public sealed class StockCommitmentService(AppDbContext db) : IStockCommitmentService
{
    public async Task CommitAsync(Guid salesOrderId, CancellationToken ct = default)
    {
        var so = await db.SalesOrders.Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.Id == salesOrderId, ct)
            ?? throw new KeyNotFoundException("Sales order not found.");
        if (so.Status != DocumentStatus.Posted)
            throw new DomainException("Only posted sales orders commit stock.");

        foreach (var line in so.Lines)
        {
            var openQty = line.Quantity - line.QuantityDelivered;
            if (openQty <= 0) continue;

            var soh = await db.StockOnHand
                .FirstOrDefaultAsync(s => s.ItemId == line.ItemId && s.WarehouseId == so.WarehouseId, ct);
            if (soh is null)
                throw new DomainException($"No stock on hand for item {line.ItemId}.");

            var available = soh.Quantity - soh.CommittedQuantity;
            if (available < openQty)
                throw new DomainException($"Insufficient available stock for item {line.ItemId}.");

            soh.CommittedQuantity += openQty;
            line.QuantityCommitted = openQty;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task ReleaseAsync(Guid salesOrderId, CancellationToken ct = default)
    {
        var so = await db.SalesOrders.Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.Id == salesOrderId, ct)
            ?? throw new KeyNotFoundException("Sales order not found.");

        foreach (var line in so.Lines.Where(l => l.QuantityCommitted > 0))
        {
            var soh = await db.StockOnHand
                .FirstOrDefaultAsync(s => s.ItemId == line.ItemId && s.WarehouseId == so.WarehouseId, ct);
            if (soh is not null)
                soh.CommittedQuantity = Math.Max(0, soh.CommittedQuantity - line.QuantityCommitted);
            line.QuantityCommitted = 0;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task<decimal> GetAvailableQuantityAsync(Guid itemId, Guid warehouseId, Guid? locationId = null,
        CancellationToken ct = default)
    {
        var q = db.StockOnHand.AsNoTracking()
            .Where(s => s.ItemId == itemId && s.WarehouseId == warehouseId);
        if (locationId is not null) q = q.Where(s => s.LocationId == locationId);
        var row = await q.FirstOrDefaultAsync(ct);
        if (row is null) return 0;
        return row.Quantity - row.CommittedQuantity;
    }
}
