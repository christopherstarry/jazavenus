namespace Jaza.Domain.Auth;

/// <summary>
/// Refresh tokens have a fixed 24-hour life (NOT sliding). Each refresh issues a new token and
/// revokes the old one (rotation). Storing only the SHA-256 hash means a DB leak does not expose
/// usable tokens. Tied to a SecurityVersion snapshot so a password change globally invalidates
/// every outstanding refresh token for that user.
/// </summary>
public sealed class RefreshToken
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }

    /// <summary>SHA-256 hex of the raw token string returned to the client.</summary>
    public required string TokenHash { get; set; }

    /// <summary>
    /// Snapshot of AppUser.SecurityVersion at issue time. If the user's SecurityVersion has rotated
    /// (e.g. password change) any token whose snapshot does not match is rejected during refresh.
    /// </summary>
    public required Guid SecurityVersion { get; set; }

    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAtUtc { get; set; }

    /// <summary>Optional pointer to the new token issued when this one was rotated.</summary>
    public Guid? ReplacedById { get; set; }

    /// <summary>Free-form note (e.g. "rotated", "logout", "password-changed").</summary>
    public string? RevocationReason { get; set; }

    public string? CreatedByIp { get; set; }
    public string? CreatedByUserAgent { get; set; }

    public bool IsActive => RevokedAtUtc is null && DateTime.UtcNow < ExpiresAtUtc;
}
