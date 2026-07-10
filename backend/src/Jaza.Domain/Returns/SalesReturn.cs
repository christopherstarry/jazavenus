using Jaza.Domain.Common;
using Jaza.Domain.Inbound;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Outbound;

namespace Jaza.Domain.Returns;

public sealed class SalesReturn : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? DeliveryOrderId { get; set; }
    public DeliveryOrder? DeliveryOrder { get; set; }
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public string? ReturnCode { get; set; }
    public DateTime ReturnDate { get; set; }
    public string? Notes { get; set; }

    public List<SalesReturnLine> Lines { get; set; } = [];
}

public sealed class SalesReturnLine : Entity, IBaseDocumentLine
{
    public Guid SalesReturnId { get; set; }
    public SalesReturn? SalesReturn { get; set; }
    public int LineNumber { get; set; }

    public string? BaseDocumentType { get; set; }
    public Guid? BaseDocumentId { get; set; }
    public int? BaseLineNumber { get; set; }
    public decimal? BaseQuantity { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal Discount2Percent { get; set; }
    public decimal Discount3Percent { get; set; }
    public decimal TaxPercent { get; set; }
}

public sealed class PurchaseReturn : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? GoodsReceiptNoteId { get; set; }
    public GoodsReceiptNote? GoodsReceiptNote { get; set; }
    public string? ReturnCode { get; set; }
    public DateTime ReturnDate { get; set; }
    public string? Notes { get; set; }

    public List<PurchaseReturnLine> Lines { get; set; } = [];
}

public sealed class PurchaseReturnLine : Entity, IBaseDocumentLine
{
    public Guid PurchaseReturnId { get; set; }
    public PurchaseReturn? PurchaseReturn { get; set; }
    public int LineNumber { get; set; }

    public string? BaseDocumentType { get; set; }
    public Guid? BaseDocumentId { get; set; }
    public int? BaseLineNumber { get; set; }
    public decimal? BaseQuantity { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal DiscountPercent { get; set; }
}

public sealed class CreditMemo : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? SalesReturnId { get; set; }
    public SalesReturn? SalesReturn { get; set; }
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public DateTime IssueDate { get; set; }
    public string Currency { get; set; } = "IDR";
    public string? TaxSerial { get; set; }
    public string? Notes { get; set; }

    public List<CreditMemoLine> Lines { get; set; } = [];
}

public sealed class CreditMemoLine : Entity, IBaseDocumentLine
{
    public Guid CreditMemoId { get; set; }
    public CreditMemo? CreditMemo { get; set; }
    public int LineNumber { get; set; }

    public string? BaseDocumentType { get; set; }
    public Guid? BaseDocumentId { get; set; }
    public int? BaseLineNumber { get; set; }
    public decimal? BaseQuantity { get; set; }

    public Guid? ItemId { get; set; }
    public Item? Item { get; set; }
    public required string Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
}
