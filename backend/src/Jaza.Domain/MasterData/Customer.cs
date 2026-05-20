using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class Customer : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? IdNo { get; set; }
    public string? TaxId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Phone2 { get; set; }
    public string? Fax { get; set; }
    public string? ContactPerson { get; set; }
    public string? BillingAddress { get; set; }
    public string? ShippingAddress { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public decimal CreditLimit { get; set; }
    public int PaymentTermsDays { get; set; } = 30;

    public DateTime? NPWPDate { get; set; }
    public string? PKPNumber { get; set; }
    public DateTime? PKPDate { get; set; }
    public string? Notes { get; set; }
    public DateTime? RegisteredAt { get; set; }

    public string? AreaCode { get; set; }
    public string? SalesmanCode { get; set; }
    public string? CollectorCode { get; set; }
    public string? DistributionType { get; set; }
    public string? TradeType { get; set; }
    public string? SubTradeType { get; set; }
    public string? OutletType { get; set; }
    public string? GroupOutletCode { get; set; }
    public string? GroupOutletTypeCode { get; set; }
    public string? PriceCode { get; set; }
    public string? DiscountCode { get; set; }
    public string? WarehouseCode { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<CustomerAddress> Addresses { get; set; } = [];
    public ICollection<BrandDiscount> BrandDiscounts { get; set; } = [];
}
