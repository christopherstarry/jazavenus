using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Outbound;

public sealed class SalesOrder : Entity
{
    public required string Number { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public DateTime OrderDate { get; set; }
    public DateTime? RequestedDate { get; set; }
    public string Currency { get; set; } = "IDR";
    public string? Notes { get; set; }

    public List<SalesOrderLine> Lines { get; set; } = [];

    public decimal SubTotal => Lines.Sum(l => l.LineSubtotal);
    public decimal TaxTotal => Lines.Sum(l => l.TaxAmount);
    public decimal GrandTotal => SubTotal + TaxTotal;
}

public sealed class SalesOrderLine : Entity
{
    public Guid SalesOrderId { get; set; }
    public SalesOrder? SalesOrder { get; set; }

    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }

    public decimal LineSubtotal => Quantity * UnitPrice * (1m - DiscountPercent / 100m);
    public decimal TaxAmount => LineSubtotal * TaxPercent / 100m;
    public decimal LineTotal => LineSubtotal + TaxAmount;

    public decimal QuantityDelivered { get; set; }
    public decimal QuantityOpen => Quantity - QuantityDelivered;
}
