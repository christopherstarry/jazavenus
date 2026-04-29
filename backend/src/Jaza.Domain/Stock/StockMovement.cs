using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Stock;

/// <summary>
/// Append-only ledger of all stock changes. StockOnHand is a projection of this table,
/// not an authoritative source — never UPDATE this row, only INSERT reversals.
/// </summary>
public sealed class StockMovement : Entity
{
    public StockMovementType Type { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    /// <summary>Signed quantity: positive = IN, negative = OUT.</summary>
    public decimal Quantity { get; set; }

    /// <summary>Unit cost at the time of this movement (weighted-average or FIFO layer cost).</summary>
    public decimal UnitCost { get; set; }

    public DateTime OccurredAtUtc { get; set; }

    /// <summary>FK to the source document table, e.g. "GoodsReceiptNote" or "DeliveryOrder".</summary>
    public string SourceDocumentType { get; set; } = string.Empty;
    public Guid SourceDocumentId { get; set; }
    public string? SourceDocumentNumber { get; set; }

    /// <summary>If non-null, this movement reverses an earlier one (sign should be flipped).</summary>
    public Guid? ReversesMovementId { get; set; }

    public string? Notes { get; set; }
}
