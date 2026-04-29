using FluentValidation;

namespace Jaza.Application.MasterData;

public sealed class UnitUpsertValidator : AbstractValidator<UnitUpsertDto>
{
    public UnitUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(16).Matches("^[A-Z0-9_-]+$");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public sealed class CategoryUpsertValidator : AbstractValidator<CategoryUpsertDto>
{
    public CategoryUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public sealed class ItemUpsertValidator : AbstractValidator<ItemUpsertDto>
{
    public ItemUpsertValidator()
    {
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Barcode).MaximumLength(64);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.UnitId).NotEmpty();
        RuleFor(x => x.StandardCost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.StandardPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.ReorderLevel).GreaterThanOrEqualTo(0).When(x => x.ReorderLevel.HasValue);
        RuleFor(x => x.ReorderQuantity).GreaterThan(0).When(x => x.ReorderQuantity.HasValue);
    }
}

public sealed class SupplierUpsertValidator : AbstractValidator<SupplierUpsertDto>
{
    public SupplierUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.PaymentTermsDays).InclusiveBetween(0, 365);
    }
}

public sealed class CustomerUpsertValidator : AbstractValidator<CustomerUpsertDto>
{
    public CustomerUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.PaymentTermsDays).InclusiveBetween(0, 365);
        RuleFor(x => x.CreditLimit).GreaterThanOrEqualTo(0);
    }
}

public sealed class WarehouseUpsertValidator : AbstractValidator<WarehouseUpsertDto>
{
    public WarehouseUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

public sealed class LocationUpsertValidator : AbstractValidator<LocationUpsertDto>
{
    public LocationUpsertValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
    }
}
