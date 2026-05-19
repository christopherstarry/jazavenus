using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class ItemPrice : Entity
{
    public Guid ItemId { get; set; }
    public Item? Item { get; set; }
    public Guid PriceTierId { get; set; }
    public PriceTier? PriceTier { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
