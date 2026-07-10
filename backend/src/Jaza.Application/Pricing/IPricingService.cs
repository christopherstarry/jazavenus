namespace Jaza.Application.Pricing;

public sealed record PricingResult(
    decimal UnitPrice,
    decimal Discount1Percent,
    decimal Discount2Percent,
    decimal Discount3Percent);

public interface IPricingService
{
    Task<PricingResult> ResolveAsync(Guid customerId, Guid itemId, decimal quantity, DateTime asOf,
        CancellationToken ct = default);
}
