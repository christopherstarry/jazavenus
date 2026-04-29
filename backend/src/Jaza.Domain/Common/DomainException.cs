namespace Jaza.Domain.Common;

/// <summary>
/// Thrown by the Domain layer when a business invariant is violated.
/// Surfaced as HTTP 400 by the API ProblemDetails handler.
/// </summary>
public sealed class DomainException(string message) : Exception(message);
