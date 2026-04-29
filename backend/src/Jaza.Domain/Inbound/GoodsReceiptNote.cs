using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Inbound;

/// <summary>
/// Acknowledges physical receipt of goods. On Post(), inserts StockMovement(GoodsReceipt)
/// rows and updates StockOnHand transactionally.
/// </summary>
public sealed class GoodsReceiptNote : Entity
{
    public required string Number { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid? PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public DateTime ReceivedAt { get; set; }
    public string? SupplierDeliveryNote { get; set; }
    public string? Notes { get; set; }

    public List<GoodsReceiptLine> Lines { get; set; } = [];
}

public sealed class GoodsReceiptLine : Entity
{
    public Guid GoodsReceiptNoteId { get; set; }
    public GoodsReceiptNote? GoodsReceiptNote { get; set; }

    public Guid? PurchaseOrderLineId { get; set; }
    public PurchaseOrderLine? PurchaseOrderLine { get; set; }

    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? BatchOrSerial { get; set; }
    public DateTime? ExpiryDate { get; set; }
}
