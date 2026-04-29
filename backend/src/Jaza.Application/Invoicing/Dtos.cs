using FluentValidation;
using Jaza.Domain.Invoicing;

namespace Jaza.Application.Invoicing;

public sealed record InvoiceLineDto(Guid? Id, int LineNumber, Guid? ItemId, string Description,
    decimal Quantity, decimal UnitPrice, decimal DiscountPercent, decimal TaxPercent);

public sealed record InvoiceDto(Guid Id, string Number, InvoiceStatus Status,
    Guid CustomerId, string? CustomerName, Guid? DeliveryOrderId, string? DeliveryOrderNumber,
    DateTime IssueDate, DateTime DueDate, string Currency, string? Notes,
    decimal SubTotal, decimal TaxTotal, decimal GrandTotal,
    decimal AmountPaid, decimal AmountDue,
    IReadOnlyList<InvoiceLineDto> Lines);

public sealed record InvoiceUpsertLineDto(int LineNumber, Guid? ItemId, string Description,
    decimal Quantity, decimal UnitPrice, decimal DiscountPercent = 0, decimal TaxPercent = 0);

public sealed record InvoiceUpsertDto(Guid CustomerId, Guid? DeliveryOrderId,
    DateTime IssueDate, DateTime DueDate, string Currency, string? Notes,
    IReadOnlyList<InvoiceUpsertLineDto> Lines);

public sealed class InvoiceUpsertValidator : AbstractValidator<InvoiceUpsertDto>
{
    public InvoiceUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.IssueDate);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
            l.RuleFor(x => x.DiscountPercent).InclusiveBetween(0, 100);
            l.RuleFor(x => x.TaxPercent).InclusiveBetween(0, 100);
        });
    }
}

public sealed record PaymentDto(Guid Id, Guid InvoiceId, DateTime ReceivedAt, PaymentMethod Method,
    decimal Amount, string Currency, string? Reference, string? Notes);

public sealed record PaymentCreateDto(DateTime ReceivedAt, PaymentMethod Method,
    decimal Amount, string Currency, string? Reference, string? Notes);

public sealed class PaymentCreateValidator : AbstractValidator<PaymentCreateDto>
{
    public PaymentCreateValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}
