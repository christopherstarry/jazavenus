using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class DiscountCode : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public decimal DiscountPercent { get; set; }
    public bool IsActive { get; set; } = true;
}
