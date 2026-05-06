using System.Security.Cryptography;
using Jaza.Application.Auth;
using Jaza.Domain.Auth;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Jaza.Infrastructure.Auth;

/// <summary>
/// Refresh-token store. Tokens are 256 bits of CSPRNG randomness (Base64URL-encoded). Only the
/// SHA-256 hash is persisted, so a database leak does not yield usable tokens.
///
/// Lifetime is fixed (24h, NOT sliding — PRD §7). Each refresh issues a brand-new token and
/// revokes the old one; the new token is bound to the user's current SecurityVersion, so any
/// password reset cascades into all outstanding tokens becoming invalid on next use.
/// </summary>
public sealed class RefreshTokenService(AppDbContext db, IConfiguration config) : IRefreshTokenService
{
    public TimeSpan RefreshTokenLifetime { get; } =
        TimeSpan.FromHours(int.Parse(config.GetSection("Jwt")["RefreshTokenHours"] ?? "24"));

    public async Task<(string RawToken, DateTime ExpiresAtUtc)> IssueAsync(
        Guid userId, Guid securityVersion, string? ip, string? userAgent, CancellationToken ct)
    {
        var raw = GenerateRawToken();
        var hash = Hash(raw);
        var expires = DateTime.UtcNow.Add(RefreshTokenLifetime);

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            TokenHash = hash,
            SecurityVersion = securityVersion,
            ExpiresAtUtc = expires,
            CreatedByIp = Truncate(ip, 45),
            CreatedByUserAgent = Truncate(userAgent, 256),
        });
        await db.SaveChangesAsync(ct);
        return (raw, expires);
    }

    public async Task<RefreshTokenValidation?> ValidateAsync(string rawToken, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(rawToken)) return null;
        var hash = Hash(rawToken);

        var row = await db.RefreshTokens
            .AsNoTracking()
            .Where(t => t.TokenHash == hash)
            .FirstOrDefaultAsync(ct);
        if (row is null) return null;
        if (row.RevokedAtUtc is not null) return null;
        if (row.ExpiresAtUtc <= DateTime.UtcNow) return null;

        // Confirm the token is still bound to the user's CURRENT security version.
        var currentVersion = await db.Users
            .Where(u => u.Id == row.UserId && u.IsActive)
            .Select(u => (Guid?)u.SecurityVersion)
            .FirstOrDefaultAsync(ct);
        if (currentVersion is null || currentVersion != row.SecurityVersion) return null;

        return new RefreshTokenValidation(row.Id, row.UserId, row.SecurityVersion, row.ExpiresAtUtc);
    }

    public async Task<(string RawToken, DateTime ExpiresAtUtc)> RotateAsync(
        Guid oldTokenId, Guid userId, Guid securityVersion,
        string? ip, string? userAgent, CancellationToken ct)
    {
        var raw = GenerateRawToken();
        var hash = Hash(raw);
        var expires = DateTime.UtcNow.Add(RefreshTokenLifetime);

        var newRow = new RefreshToken
        {
            UserId = userId,
            TokenHash = hash,
            SecurityVersion = securityVersion,
            ExpiresAtUtc = expires,
            CreatedByIp = Truncate(ip, 45),
            CreatedByUserAgent = Truncate(userAgent, 256),
        };
        db.RefreshTokens.Add(newRow);

        var old = await db.RefreshTokens.FirstOrDefaultAsync(t => t.Id == oldTokenId, ct);
        if (old is not null && old.RevokedAtUtc is null)
        {
            old.RevokedAtUtc = DateTime.UtcNow;
            old.RevocationReason = "rotated";
            old.ReplacedById = newRow.Id;
        }

        await db.SaveChangesAsync(ct);
        return (raw, expires);
    }

    public async Task RevokeAsync(Guid tokenId, string reason, CancellationToken ct)
    {
        var row = await db.RefreshTokens.FirstOrDefaultAsync(t => t.Id == tokenId, ct);
        if (row is null || row.RevokedAtUtc is not null) return;
        row.RevokedAtUtc = DateTime.UtcNow;
        row.RevocationReason = Truncate(reason, 64);
        await db.SaveChangesAsync(ct);
    }

    public async Task RevokeAllForUserAsync(Guid userId, string reason, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var truncated = Truncate(reason, 64);
        await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.RevokedAtUtc, now)
                .SetProperty(t => t.RevocationReason, truncated), ct);
    }

    /// <summary>32 bytes (256 bits) → ~43 char Base64URL string. URL-safe, no padding.</summary>
    private static string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string Hash(string raw)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(raw);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexStringLower(hash);
    }

    private static string? Truncate(string? value, int max) =>
        string.IsNullOrEmpty(value) ? value : value.Length > max ? value[..max] : value;
}
