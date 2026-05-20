namespace Jaza.Application.MasterData;

public sealed record UnitDto(Guid Id, string Code, string Name, bool IsActive);
public sealed record UnitUpsertDto(string Code, string Name, bool IsActive = true);

public sealed record CategoryDto(Guid Id, string Code, string Name, Guid? ParentId, bool IsActive);
public sealed record CategoryUpsertDto(string Code, string Name, Guid? ParentId, bool IsActive = true);

public sealed record ItemDto(
    Guid Id, string Sku, string Name, string? Barcode, string? Description,
    Guid CategoryId, string? CategoryName, Guid UnitId, string? UnitCode,
    decimal? StandardCost, decimal StandardPrice, string Currency,
    decimal? ReorderLevel, decimal? ReorderQuantity, bool IsActive);

public sealed record ItemUpsertDto(
    string Sku, string Name, string? Barcode, string? Description,
    Guid CategoryId, Guid UnitId,
    decimal StandardCost, decimal StandardPrice, string Currency,
    decimal? ReorderLevel, decimal? ReorderQuantity, bool IsActive = true);

public sealed record SupplierDto(Guid Id, string Code, string Name, string? TaxId, string? Email, string? Phone,
    string? Address, string? City, string? Country, int PaymentTermsDays, bool IsActive);
public sealed record SupplierUpsertDto(string Code, string Name, string? TaxId, string? Email, string? Phone,
    string? Address, string? City, string? Country, int PaymentTermsDays = 30, bool IsActive = true);

public sealed record CustomerDto(Guid Id, string Code, string Name,
    string? IdNo, string? TaxId, string? Email, string? Phone, string? Phone2, string? Fax, string? ContactPerson,
    string? BillingAddress, string? ShippingAddress, string? City, string? Country,
    decimal CreditLimit, int PaymentTermsDays,
    string? AreaCode, string? SalesmanCode, string? CollectorCode,
    string? DistributionType, string? TradeType, string? SubTradeType, string? OutletType,
    string? GroupOutletCode, string? GroupOutletTypeCode,
    string? PriceCode, string? DiscountCode, string? WarehouseCode,
    DateTime? NPWPDate, string? PKPNumber, DateTime? PKPDate,
    string? Notes, DateTime? RegisteredAt,
    bool IsActive);
public sealed record CustomerUpsertDto(string Code, string Name,
    string? IdNo, string? TaxId, string? Email, string? Phone, string? Phone2, string? Fax, string? ContactPerson,
    string? BillingAddress, string? ShippingAddress, string? City, string? Country,
    decimal CreditLimit = 0, int PaymentTermsDays = 30,
    string? AreaCode = null, string? SalesmanCode = null, string? CollectorCode = null,
    string? DistributionType = null, string? TradeType = null, string? SubTradeType = null, string? OutletType = null,
    string? GroupOutletCode = null, string? GroupOutletTypeCode = null,
    string? PriceCode = null, string? DiscountCode = null, string? WarehouseCode = null,
    DateTime? NPWPDate = null, string? PKPNumber = null, DateTime? PKPDate = null,
    string? Notes = null, DateTime? RegisteredAt = null,
    bool IsActive = true);

public sealed record CustomerAddressDto(Guid Id, Guid CustomerId, string Label, string Address, string? City, string? Country, bool IsDefault, bool IsActive);
public sealed record CustomerAddressUpsertDto(Guid CustomerId, string Label, string Address, string? City, string? Country = null, bool IsDefault = false, bool IsActive = true);

public sealed record BrandDiscountDto(Guid Id, Guid CustomerId, string BrandCode, decimal DiscountPercent, decimal DiscountPercent2, string? PriceCode, bool IsActive);
public sealed record BrandDiscountUpsertDto(Guid CustomerId, string BrandCode, decimal DiscountPercent = 0, decimal DiscountPercent2 = 0, string? PriceCode = null, bool IsActive = true);

public sealed record WarehouseDto(Guid Id, string Code, string Name, string? Address, bool IsActive);
public sealed record WarehouseUpsertDto(string Code, string Name, string? Address, bool IsActive = true);

public sealed record LocationDto(Guid Id, Guid WarehouseId, string Code, string? Name, bool IsActive);
public sealed record LocationUpsertDto(Guid WarehouseId, string Code, string? Name, bool IsActive = true);

// Simple reference data (code + name)
public sealed record RefDto(Guid Id, string Code, string Name, bool IsActive);
public sealed record RefUpsertDto(string Code, string Name, bool IsActive = true);

// PaymentTerm (code + name + net days)
public sealed record PaymentTermDto(Guid Id, string Code, string Name, int NetDays, bool IsActive);
public sealed record PaymentTermUpsertDto(string Code, string Name, int NetDays = 30, bool IsActive = true);

// PriceTier (code + name + markup percent)
public sealed record PriceTierDto(Guid Id, string Code, string Name, decimal MarkupPercent, bool IsActive);
public sealed record PriceTierUpsertDto(string Code, string Name, decimal MarkupPercent = 0, bool IsActive = true);

// DiscountCode (code + name + discount percent)
public sealed record DiscountCodeDto(Guid Id, string Code, string Name, decimal DiscountPercent, bool IsActive);
public sealed record DiscountCodeUpsertDto(string Code, string Name, decimal DiscountPercent = 0, bool IsActive = true);

// SubCategory (code + name + categoryId)
public sealed record SubCategoryDto(Guid Id, string Code, string Name, Guid CategoryId, string? CategoryName, bool IsActive);
public sealed record SubCategoryUpsertDto(string Code, string Name, Guid CategoryId, bool IsActive = true);

// ItemPrice (item + price tier + price)
public sealed record ItemPriceDto(Guid Id, Guid ItemId, string? ItemSku, Guid PriceTierId, string? PriceTierCode, decimal Price, bool IsActive);
public sealed record ItemPriceUpsertDto(Guid ItemId, Guid PriceTierId, decimal Price, bool IsActive = true);

// ItemDiscount (item + discount code + rate + date range)
public sealed record ItemDiscountDto(Guid Id, Guid ItemId, string? ItemSku, Guid DiscountCodeId, string? DiscountCodeName, decimal DiscountPercent, DateTime? StartDateUtc, DateTime? EndDateUtc, bool IsActive);
public sealed record ItemDiscountUpsertDto(Guid ItemId, Guid DiscountCodeId, decimal DiscountPercent, DateTime? StartDateUtc, DateTime? EndDateUtc, bool IsActive = true);
