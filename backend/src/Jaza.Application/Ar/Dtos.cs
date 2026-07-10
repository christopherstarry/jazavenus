using FluentValidation;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;

namespace Jaza.Application.Ar;

public sealed record PaymentAllocationDto(Guid InvoiceId, decimal Amount, string? Notes);

public sealed record BatchPaymentDto(
    Guid CustomerId, DateTime ReceivedAt, PaymentMethod Method, string Currency,
    string? Reference, string? Notes, IReadOnlyList<PaymentAllocationDto> Allocations);

public sealed class BatchPaymentValidator : AbstractValidator<BatchPaymentDto>
{
    public BatchPaymentValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.ReceivedAt).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Allocations).NotEmpty();
        RuleForEach(x => x.Allocations).ChildRules(a =>
        {
            a.RuleFor(x => x.InvoiceId).NotEmpty();
            a.RuleFor(x => x.Amount).GreaterThan(0);
        });
    }
}

public sealed record PdcClearanceHistoryDto(
    Guid Id, PdcStatus FromStatus, PdcStatus ToStatus,
    DateTime OccurredAtUtc, Guid? UserId, string? Notes);

public sealed record PostDatedCheckDto(
    Guid Id, string Number, string Division, PdcStatus Status,
    Guid CustomerId, string? CustomerName, Guid? BankId, string? BankCode,
    decimal Amount, string Currency, DateTime ChequeDate, DateTime ReceivedAt,
    string? Reference, string? Notes, IReadOnlyList<PdcClearanceHistoryDto> History);

public sealed record PostDatedCheckUpsertDto(
    Guid CustomerId, Guid? BankId, decimal Amount, string Currency,
    DateTime ChequeDate, DateTime ReceivedAt, string? Reference, string? Notes);

public sealed class PostDatedCheckUpsertValidator : AbstractValidator<PostDatedCheckUpsertDto>
{
    public PostDatedCheckUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.ChequeDate).NotEmpty();
        RuleFor(x => x.ReceivedAt).NotEmpty();
    }
}

public sealed record PdcActionDto(string? Notes);

public sealed record ArAdjustmentDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid CustomerId, string? CustomerName, DateTime AdjustmentDate,
    decimal Amount, string Currency, string? ReasonCode, string? Notes);

public sealed record ArAdjustmentUpsertDto(
    Guid CustomerId, DateTime AdjustmentDate, decimal Amount, string Currency,
    string? ReasonCode, string? Notes);

public sealed class ArAdjustmentUpsertValidator : AbstractValidator<ArAdjustmentUpsertDto>
{
    public ArAdjustmentUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.AdjustmentDate).NotEmpty();
        RuleFor(x => x.Amount).NotEqual(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public sealed record ArRecalculateBalanceDto(string? Division);

public sealed record ArClosePeriodDto(int Year, int Month, string? Notes);

public sealed class ArClosePeriodDtoValidator : AbstractValidator<ArClosePeriodDto>
{
    public ArClosePeriodDtoValidator()
    {
        RuleFor(x => x.Year).GreaterThan(2000);
        RuleFor(x => x.Month).InclusiveBetween(1, 12);
    }
}
