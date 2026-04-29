using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Stock;

/// <summary>
/// Materialised projection: current quantity per Item × Warehouse × Location.
/// Updated transactionally inside the same SaveChanges that inserts the StockMovement.
/// </summary>
public sealed class StockOnHand : Entity
{
    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }

    /// <summary>Weighted-average unit cost. Used for COGS at issue time.</summary>
    public decimal AverageCost { get; set; }

    public DateTime LastMovementAtUtc { get; set; }
}
