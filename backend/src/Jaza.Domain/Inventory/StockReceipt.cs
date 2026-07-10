using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Inventory;

public sealed class StockReceipt : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime ReceiptDate { get; set; }
    public string? ReasonCode { get; set; }
    public string? Notes { get; set; }

    public List<StockReceiptLine> Lines { get; set; } = [];
}

public sealed class StockReceiptLine : Entity
{
    public Guid StockReceiptId { get; set; }
    public StockReceipt? StockReceipt { get; set; }
    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? BatchOrSerial { get; set; }
}

public sealed class StockIssue : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime IssueDate { get; set; }
    public string? ReasonCode { get; set; }
    public string? Notes { get; set; }

    public List<StockIssueLine> Lines { get; set; } = [];
}

public sealed class StockIssueLine : Entity
{
    public Guid StockIssueId { get; set; }
    public StockIssue? StockIssue { get; set; }
    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
}

public sealed class StockTransfer : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid FromWarehouseId { get; set; }
    public Warehouse? FromWarehouse { get; set; }
    public Guid ToWarehouseId { get; set; }
    public Warehouse? ToWarehouse { get; set; }

    public DateTime TransferDate { get; set; }
    public string? Notes { get; set; }

    public List<StockTransferLine> Lines { get; set; } = [];
}

public sealed class StockTransferLine : Entity
{
    public Guid StockTransferId { get; set; }
    public StockTransfer? StockTransfer { get; set; }
    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid? FromLocationId { get; set; }
    public Location? FromLocation { get; set; }
    public Guid? ToLocationId { get; set; }
    public Location? ToLocation { get; set; }

    public decimal Quantity { get; set; }
}

public enum StockTakeStatus
{
    Open = 0,
    Counting = 10,
    Posted = 20,
    Cancelled = 90,
}

public sealed class StockTakeSession : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public StockTakeStatus Status { get; set; } = StockTakeStatus.Open;

    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Notes { get; set; }

    public List<StockTakeLine> Lines { get; set; } = [];
}

public sealed class StockTakeLine : Entity
{
    public Guid StockTakeSessionId { get; set; }
    public StockTakeSession? StockTakeSession { get; set; }
    public int LineNumber { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public decimal SystemQuantity { get; set; }
    public decimal? CountedQuantity { get; set; }
    public decimal Variance => (CountedQuantity ?? SystemQuantity) - SystemQuantity;
}
