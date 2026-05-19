using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class ItemDiscount : Entity
{
    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid DiscountCodeId { get; set; }
    public DiscountCode? DiscountCode { get; set; }
    public decimal DiscountPercent { get; set; }
    public DateTime? StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }
    public bool IsActive { get; set; } = true;
}
