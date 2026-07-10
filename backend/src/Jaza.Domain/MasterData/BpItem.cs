using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

/// <summary>
/// Business-partner item cross-reference: maps a supplier's own SKU/code for an item to our
/// internal <see cref="Item"/> and unit conversion, so purchase documents and EDI imports can
/// resolve the supplier's code to the right internal item. See
/// docs/modules/master-data/prds/bp-item.md.
/// </summary>
public sealed class BpItem : Entity
{
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public required string SupplierItemCode { get; set; }

    public Guid ItemId { get; set; }
    public Item? Item { get; set; }

    public string? Uom { get; set; }
    public decimal ConversionFactor { get; set; } = 1;
    public bool IsActive { get; set; } = true;
}
