using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class Customer : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? TaxId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? BillingAddress { get; set; }
    public string? ShippingAddress { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public decimal CreditLimit { get; set; }
    public int PaymentTermsDays { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}
