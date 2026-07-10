using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

/// <summary>
/// Customer product-penetration target: how many distinct SKUs (optionally scoped to a brand or
/// category, or a single item) a customer is expected to carry in a given fiscal month — feeds
/// sales penetration analysis reports. See docs/modules/master-data/prds/penetration.md.
/// </summary>
public sealed class Penetration : Entity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? ItemId { get; set; }
    public Item? Item { get; set; }

    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }

    public Guid? CategoryId { get; set; }
    public ItemCategory? Category { get; set; }

    public int TargetSkuCount { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
}
