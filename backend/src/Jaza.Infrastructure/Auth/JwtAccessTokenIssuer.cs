using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Jaza.Application.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Jaza.Infrastructure.Auth;

/// <summary>
/// Issues a JWT signed with HMAC-SHA256. The secret comes from config (Jwt:SigningKey) — generated
/// per environment. We embed the user id, email, role, and the user's SecurityVersion so a stolen
/// access token becomes useless the moment the password is rotated (the version changes and
/// any /api/auth/me fetch will reject the mismatch).
/// </summary>
public sealed class JwtAccessTokenIssuer : IAccessTokenIssuer
{
    public const string ClaimSecurityVersion = "ver";
    public const string ClaimIsDeveloper = "dev";

    private readonly SigningCredentials _credentials;
    private readonly string _issuer;
    private readonly string _audience;

    public TimeSpan AccessTokenLifetime { get; }

    public JwtAccessTokenIssuer(IConfiguration config)
    {
        var section = config.GetSection("Jwt");
        var key = section["SigningKey"]
            ?? throw new InvalidOperationException(
                "Configuration 'Jwt:SigningKey' is required. Set it in appsettings or via the JWT__SIGNINGKEY env variable.");
        if (key.Length < 32)
            throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters of entropy.");

        _issuer = section["Issuer"] ?? "jaza-venus";
        _audience = section["Audience"] ?? "jaza-venus-app";
        AccessTokenLifetime = TimeSpan.FromMinutes(
            int.Parse(section["AccessTokenMinutes"] ?? "15", CultureInfo.InvariantCulture));

        var bytes = Encoding.UTF8.GetBytes(key);
        _credentials = new SigningCredentials(new SymmetricSecurityKey(bytes), SecurityAlgorithms.HmacSha256);
    }

    public (string Token, DateTime ExpiresAtUtc) Issue(
        Guid userId, string email, string role, bool isDeveloper, Guid securityVersion)
    {
        var now = DateTime.UtcNow;
        var expires = now + AccessTokenLifetime;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, email),
            new(ClaimTypes.Role, role),
            new(ClaimSecurityVersion, securityVersion.ToString()),
            new(ClaimIsDeveloper, isDeveloper ? "true" : "false"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: _credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    /// <summary>Used by the JwtBearer authentication setup.</summary>
    public static TokenValidationParameters BuildValidationParameters(IConfiguration config)
    {
        var section = config.GetSection("Jwt");
        var key = section["SigningKey"]
            ?? throw new InvalidOperationException("Configuration 'Jwt:SigningKey' is required.");
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = section["Issuer"] ?? "jaza-venus",
            ValidateAudience = true,
            ValidAudience = section["Audience"] ?? "jaza-venus-app",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role,
        };
    }

    /// <summary>Convenience helper: generate a 64-char URL-safe random secret.</summary>
    public static string GenerateRandomSigningKey()
    {
        var bytes = RandomNumberGenerator.GetBytes(48);
        return Convert.ToBase64String(bytes);
    }
}
