using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Outbound;

/// <summary>
/// Acknowledges physical issue of goods to a customer. On Post(), inserts
/// StockMovement(GoodsIssue) rows and updates StockOnHand transactionally.
/// </summary>
public sealed class DeliveryOrder : Entity
{
    public required string Number { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid? SalesOrderId { get; set; }
    public SalesOrder? SalesOrder { get; set; }

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public DateTime DeliveredAt { get; set; }
    public string? Notes { get; set; }

    public List<DeliveryOrderLine> Lines { get; set; } = [];
}

public sealed class DeliveryOrderLine : Entity
{
    public Guid DeliveryOrderId { get; set; }
    public DeliveryOrder? DeliveryOrder { get; set; }

    public Guid? SalesOrderLineId { get; set; }
    public SalesOrderLine? SalesOrderLine { get; set; }

    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }
    /// <summary>Cost picked up from StockOnHand.AverageCost at the moment of posting (immutable thereafter).</summary>
    public decimal UnitCost { get; set; }
}
