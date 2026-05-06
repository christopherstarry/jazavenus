using FluentAssertions;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Infrastructure.Auth;
using Jaza.Infrastructure.Identity;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class RefreshTokenServiceTests(PostgresFixture fx)
{
    /// <summary>
    /// Spin up a minimal service provider that points the AppDbContext at the shared Postgres
    /// container. We don't need the full ASP.NET Core pipeline for these unit-style tests.
    /// </summary>
    private async Task<(IRefreshTokenService Svc, AppDbContext Db, AppUser User, IServiceScope Scope)> NewSetupAsync()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = fx.ConnectionString,
                ["Jwt:RefreshTokenHours"] = "24",
            }).Build();

        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(config);
        services.AddSingleton<Application.Common.ICurrentUser, NullCurrentUser>();
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(fx.ConnectionString)
               .AddInterceptors(new AuditSaveChangesInterceptor(new NullCurrentUser())));
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();

        var provider = services.BuildServiceProvider();
        var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = $"rt-{Guid.NewGuid():N}@jaza.local",
            Email = $"rt-{Guid.NewGuid():N}@jaza.local",
            FullName = "RT Test",
            RoleId = Roles.Code.Sales,
            IsActive = true,
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString(),
        };
        user.NormalizedUserName = user.UserName.ToUpperInvariant();
        user.NormalizedEmail = user.Email.ToUpperInvariant();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return (scope.ServiceProvider.GetRequiredService<IRefreshTokenService>(), db, user, scope);
    }

    [Fact]
    public async Task Issue_ReturnsRawToken_AndPersistsHash()
    {
        var (svc, db, user, scope) = await NewSetupAsync();
        using var _ = scope;

        var (raw, expires) = await svc.IssueAsync(user.Id, user.SecurityVersion, "127.0.0.1", "ua", default);

        raw.Should().NotBeNullOrWhiteSpace();
        raw.Length.Should().BeGreaterThan(20);
        expires.Should().BeAfter(DateTime.UtcNow.AddHours(23));
        expires.Should().BeBefore(DateTime.UtcNow.AddHours(25));

        // The raw token must NOT be stored anywhere — only the SHA-256 hash is.
        var rows = await db.RefreshTokens.Where(t => t.UserId == user.Id).ToListAsync();
        rows.Should().HaveCount(1);
        rows[0].TokenHash.Should().NotBe(raw);
        rows[0].TokenHash.Should().HaveLength(64); // SHA-256 hex
    }

    [Fact]
    public async Task Validate_AcceptsFreshToken_AndRejectsTampered()
    {
        var (svc, _, user, scope) = await NewSetupAsync();
        using var _u = scope;

        var (raw, _) = await svc.IssueAsync(user.Id, user.SecurityVersion, null, null, default);

        var ok = await svc.ValidateAsync(raw, default);
        ok.Should().NotBeNull();
        ok!.UserId.Should().Be(user.Id);

        var tampered = await svc.ValidateAsync(raw + "X", default);
        tampered.Should().BeNull();
    }

    [Fact]
    public async Task Rotate_RevokesOld_AndIssuesNew()
    {
        var (svc, db, user, scope) = await NewSetupAsync();
        using var _u = scope;

        var (raw1, _) = await svc.IssueAsync(user.Id, user.SecurityVersion, null, null, default);
        var v = await svc.ValidateAsync(raw1, default);
        var (raw2, _) = await svc.RotateAsync(v!.TokenId, user.Id, user.SecurityVersion, null, null, default);

        raw2.Should().NotBe(raw1);
        (await svc.ValidateAsync(raw1, default)).Should().BeNull("the old token is rotated");
        (await svc.ValidateAsync(raw2, default)).Should().NotBeNull("the new token is fresh");

        var oldRow = await db.RefreshTokens.FirstAsync(t => t.Id == v.TokenId);
        oldRow.RevokedAtUtc.Should().NotBeNull();
        oldRow.RevocationReason.Should().Be("rotated");
        oldRow.ReplacedById.Should().NotBeNull();
    }

    [Fact]
    public async Task RevokeAllForUser_KillsEveryActiveToken()
    {
        var (svc, _, user, scope) = await NewSetupAsync();
        using var _u = scope;

        var (a, _) = await svc.IssueAsync(user.Id, user.SecurityVersion, null, null, default);
        var (b, _) = await svc.IssueAsync(user.Id, user.SecurityVersion, null, null, default);

        await svc.RevokeAllForUserAsync(user.Id, "test", default);

        (await svc.ValidateAsync(a, default)).Should().BeNull();
        (await svc.ValidateAsync(b, default)).Should().BeNull();
    }

    [Fact]
    public async Task Validate_ReturnsNull_WhenSecurityVersionRotated()
    {
        // Simulating a password change: the user's SecurityVersion changes; outstanding tokens
        // were issued with the OLD version, so the next /refresh call must fail.
        var (svc, db, user, scope) = await NewSetupAsync();
        using var _u = scope;

        var (raw, _) = await svc.IssueAsync(user.Id, user.SecurityVersion, null, null, default);

        user.SecurityVersion = Guid.NewGuid();
        await db.SaveChangesAsync();

        (await svc.ValidateAsync(raw, default)).Should().BeNull();
    }

    private sealed class NullCurrentUser : Application.Common.ICurrentUser
    {
        public Guid? UserId => null;
        public string? UserName => null;
        public string? IpAddress => null;
        public string? UserAgent => null;
        public bool IsAuthenticated => false;
        public bool IsInRole(string role) => false;
    }
}
