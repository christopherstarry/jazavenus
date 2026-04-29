namespace Jaza.Domain.Common;

/// <summary>
/// Represents an amount with explicit currency. Stored as two columns; never use double/float for money.
/// </summary>
public readonly record struct Money(decimal Amount, string Currency)
{
    public static Money Zero(string currency) => new(0m, currency);

    public Money Add(Money other) => Currency == other.Currency
        ? new Money(Amount + other.Amount, Currency)
        : throw new InvalidOperationException($"Currency mismatch: {Currency} vs {other.Currency}");

    public override string ToString() => $"{Amount:0.0000} {Currency}";
}
