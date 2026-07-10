namespace Jaza.Application.Common;

/// <summary>Canonical division codes on transaction headers (legacy CompanyIDKu mapping).</summary>
public static class Divisions
{
    public const string DistributionBdg = "DISTRIBUTIONBDG";
    public const string DistributionCrb = "DISTRIBUTIONCRB";
    public const string TradingBdg = "TRADINGBDG";
    public const string TradingCrb = "TRADINGCRB";

    public static readonly IReadOnlyList<string> All =
    [
        DistributionBdg, DistributionCrb, TradingBdg, TradingCrb,
    ];

    public static bool IsValid(string? division) =>
        !string.IsNullOrWhiteSpace(division) && All.Contains(division, StringComparer.OrdinalIgnoreCase);

    public static string Normalize(string division) =>
        All.First(d => d.Equals(division, StringComparison.OrdinalIgnoreCase));
}
