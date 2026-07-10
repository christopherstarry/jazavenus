using FluentValidation;

namespace Jaza.Application.Settings;

public sealed record CompanySettingsDto(
    Guid Id, string Division, string CompanyName,
    string? Address, string? City, string? Phone, string? Fax,
    string? NpwpNumber, string? PkpNumber, string? DefaultCurrency, string? SettingsJson);

public sealed record CompanySettingsUpsertDto(
    string CompanyName, string? Address, string? City, string? Phone, string? Fax,
    string? NpwpNumber, string? PkpNumber, string? DefaultCurrency, string? SettingsJson);

public sealed class CompanySettingsUpsertValidator : AbstractValidator<CompanySettingsUpsertDto>
{
    public CompanySettingsUpsertValidator()
    {
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DefaultCurrency).Length(3).When(x => x.DefaultCurrency is not null);
    }
}

public sealed record FiscalPeriodDto(
    Guid Id, string Division, int Year, int Month,
    DateTime StartDate, DateTime EndDate, bool IsClosed,
    DateTime? ClosedAtUtc, Guid? ClosedByUserId);

public sealed record FiscalPeriodUpsertDto(
    int Year, int Month, DateTime StartDate, DateTime EndDate);

public sealed class FiscalPeriodUpsertValidator : AbstractValidator<FiscalPeriodUpsertDto>
{
    public FiscalPeriodUpsertValidator()
    {
        RuleFor(x => x.Year).GreaterThan(2000);
        RuleFor(x => x.Month).InclusiveBetween(1, 12);
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate);
    }
}

public sealed record OrderCodeDto(Guid Id, string Code, string Name, string? Description, bool IsActive);

public sealed record OrderCodeUpsertDto(string Code, string Name, string? Description, bool IsActive = true);

public sealed class OrderCodeUpsertValidator : AbstractValidator<OrderCodeUpsertDto>
{
    public OrderCodeUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

public sealed record ReturnCodeDto(Guid Id, string Code, string Name, string? Description, bool IsActive);

public sealed record ReturnCodeUpsertDto(string Code, string Name, string? Description, bool IsActive = true);

public sealed class ReturnCodeUpsertValidator : AbstractValidator<ReturnCodeUpsertDto>
{
    public ReturnCodeUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
