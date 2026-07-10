namespace Jaza.Application.Credit;

public sealed record CreditCheckResult(bool Allowed, string? Reason, decimal CurrentExposure, decimal CreditLimit);

public interface ICreditControlService
{
    Task<CreditCheckResult> CheckAsync(Guid customerId, decimal additionalAmount, bool adminOverride = false,
        CancellationToken ct = default);

    Task<bool> HasOverdueInvoicesAsync(Guid customerId, CancellationToken ct = default);
}
