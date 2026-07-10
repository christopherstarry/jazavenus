using FluentValidation;
using Jaza.Domain.Tax;

namespace Jaza.Application.Tax;

public sealed record TaxInvoiceSerialDto(
    Guid Id, string Division, Guid TaxRegistrationId, string? TaxRegistrationCode,
    string SerialNumber, TaxSerialStatus Status,
    Guid? InvoiceId, Guid? CreditMemoId,
    DateTime? AllocatedAtUtc, Guid? AllocatedByUserId, DateTime? UsedAtUtc);

public sealed record TaxInvoiceSerialUpsertDto(
    Guid TaxRegistrationId, string SerialNumber);

public sealed class TaxInvoiceSerialUpsertValidator : AbstractValidator<TaxInvoiceSerialUpsertDto>
{
    public TaxInvoiceSerialUpsertValidator()
    {
        RuleFor(x => x.TaxRegistrationId).NotEmpty();
        RuleFor(x => x.SerialNumber).NotEmpty().MaximumLength(64);
    }
}

public sealed record PricingResolveQuery(Guid CustomerId, Guid ItemId, decimal Quantity, DateTime? AsOf);
