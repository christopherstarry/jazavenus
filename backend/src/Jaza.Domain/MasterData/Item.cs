using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class Item : Entity
{
    public required string Sku { get; set; }
    public required string Name { get; set; }
    public string? Barcode { get; set; }
    public string? Description { get; set; }

    public Guid CategoryId { get; set; }
    public ItemCategory? Category { get; set; }

    public Guid UnitId { get; set; }
    public Unit? Unit { get; set; }

    /// <summary>Internal cost; only SuperAdmin can read this in the UI.</summary>
    public decimal StandardCost { get; set; }

    public decimal StandardPrice { get; set; }
    public string Currency { get; set; } = "IDR";

    public decimal? ReorderLevel { get; set; }
    public decimal? ReorderQuantity { get; set; }

    public bool IsActive { get; set; } = true;
}
