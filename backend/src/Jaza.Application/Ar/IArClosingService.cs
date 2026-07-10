namespace Jaza.Application.Ar;

public sealed record ArClosePeriodRequest(string Division, int Year, int Month, string? Notes);

public interface IArClosingService
{
    Task ClosePeriodAsync(ArClosePeriodRequest request, Guid userId, CancellationToken ct = default);
    Task RecalculateBalancesAsync(string division, CancellationToken ct = default);
    Task EnsurePeriodOpenAsync(string division, DateTime transactionDate, CancellationToken ct = default);
}
