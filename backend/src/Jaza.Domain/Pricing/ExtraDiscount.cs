using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Pricing;

public sealed class ExtraDiscount : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string Division { get; set; } = "";
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    public List<ExtraDiscountLine> Lines { get; set; } = [];
}

public sealed class ExtraDiscountLine : Entity
{
    public Guid ExtraDiscountId { get; set; }
    public ExtraDiscount? ExtraDiscount { get; set; }

    public int LineNumber { get; set; }
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }
    public Guid? ItemId { get; set; }
    public Item? Item { get; set; }

    public decimal Discount2Percent { get; set; }
    public decimal Discount3Percent { get; set; }
}
