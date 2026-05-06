namespace Jaza.Application.Auth;

/// <summary>
/// Issues short-lived JWT access tokens. The signing key + issuer + audience come from
/// configuration (see <c>Jwt:*</c>). Access-token lifetime is 15 minutes per PRD §7.
/// </summary>
public interface IAccessTokenIssuer
{
    /// <summary>Build a JWT for the given identity claims. Returns the raw token + expiry.</summary>
    (string Token, DateTime ExpiresAtUtc) Issue(
        Guid userId,
        string email,
        string role,
        bool isDeveloper,
        Guid securityVersion);

    /// <summary>Lifetime configured in <c>Jwt:AccessTokenMinutes</c>, or 15 by default.</summary>
    TimeSpan AccessTokenLifetime { get; }
}

/// <summary>
/// Manages refresh tokens: issuance (24h, non-sliding), rotation, and revocation.
/// Tokens are stored as SHA-256 hashes; the raw token only ever returns to the caller once.
/// </summary>
public interface IRefreshTokenService
{
    /// <summary>Issue a brand-new refresh token bound to the user's current security version.</summary>
    Task<(string RawToken, DateTime ExpiresAtUtc)> IssueAsync(
        Guid userId, Guid securityVersion, string? ip, string? userAgent, CancellationToken ct);

    /// <summary>
    /// Validate an incoming raw refresh token. Returns <c>null</c> when the token is missing,
    /// expired, revoked, or no longer matches the user's current security version.
    /// </summary>
    Task<RefreshTokenValidation?> ValidateAsync(string rawToken, CancellationToken ct);

    /// <summary>Atomically rotate a token: revoke old, issue new bound to the same user.</summary>
    Task<(string RawToken, DateTime ExpiresAtUtc)> RotateAsync(
        Guid oldTokenId, Guid userId, Guid securityVersion,
        string? ip, string? userAgent, CancellationToken ct);

    /// <summary>Revoke a single token (used on logout).</summary>
    Task RevokeAsync(Guid tokenId, string reason, CancellationToken ct);

    /// <summary>Revoke every active token for a user (used after password change).</summary>
    Task RevokeAllForUserAsync(Guid userId, string reason, CancellationToken ct);

    TimeSpan RefreshTokenLifetime { get; }
}

public sealed record RefreshTokenValidation(Guid TokenId, Guid UserId, Guid SecurityVersion, DateTime ExpiresAtUtc);
