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

public sealed record CustomerDto(Guid Id, string Code, string Name, string? TaxId, string? Email, string? Phone,
    string? BillingAddress, string? ShippingAddress, string? City, string? Country,
    decimal CreditLimit, int PaymentTermsDays, bool IsActive);
public sealed record CustomerUpsertDto(string Code, string Name, string? TaxId, string? Email, string? Phone,
    string? BillingAddress, string? ShippingAddress, string? City, string? Country,
    decimal CreditLimit = 0, int PaymentTermsDays = 30, bool IsActive = true);

public sealed record WarehouseDto(Guid Id, string Code, string Name, string? Address, bool IsActive);
public sealed record WarehouseUpsertDto(string Code, string Name, string? Address, bool IsActive = true);

public sealed record LocationDto(Guid Id, Guid WarehouseId, string Code, string? Name, bool IsActive);
public sealed record LocationUpsertDto(Guid WarehouseId, string Code, string? Name, bool IsActive = true);
