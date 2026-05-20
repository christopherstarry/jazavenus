using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class BrandDiscount : Entity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public required string BrandCode { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountPercent2 { get; set; }
    public string? PriceCode { get; set; }
    public bool IsActive { get; set; } = true;
}
