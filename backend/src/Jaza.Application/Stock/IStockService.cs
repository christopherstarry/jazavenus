using Jaza.Domain.Stock;

namespace Jaza.Application.Stock;

/// <summary>
/// All stock changes flow through this service to enforce the StockMovement <-> StockOnHand invariant.
/// Every method must run inside a transaction owned by the caller.
/// </summary>
public interface IStockService
{
    Task PostMovementAsync(StockMovement movement, CancellationToken ct = default);
    Task<decimal> GetOnHandAsync(Guid itemId, Guid warehouseId, Guid? locationId = null, CancellationToken ct = default);
    Task<decimal> GetAverageCostAsync(Guid itemId, Guid warehouseId, Guid? locationId = null, CancellationToken ct = default);
}
