using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Inbound;

public sealed class PurchaseOrder : Entity
{
    public required string Number { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public string Currency { get; set; } = "IDR";

    public string? Notes { get; set; }

    public List<PurchaseOrderLine> Lines { get; set; } = [];

    public decimal SubTotal => Lines.Sum(l => l.LineTotal);
    public decimal TaxTotal => Lines.Sum(l => l.TaxAmount);
    public decimal GrandTotal => SubTotal + TaxTotal;
}

public sealed class PurchaseOrderLine : Entity
{
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }

    public decimal LineSubtotal => Quantity * UnitPrice * (1m - DiscountPercent / 100m);
    public decimal TaxAmount => LineSubtotal * TaxPercent / 100m;
    public decimal LineTotal => LineSubtotal;

    public decimal QuantityReceived { get; set; }
    public decimal QuantityOpen => Quantity - QuantityReceived;
}
