using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Testcontainers.PostgreSql;
using Xunit;

namespace Jaza.Api.IntegrationTests;

/// <summary>
/// Spins up a single throwaway PostgreSQL 17 container shared by every test class in this assembly.
/// We override the API's connection string and disable MFA enforcement so the seeded SuperAdmin
/// can log in directly. Demo users + Developer are seeded by DbInitializer because we set
/// Seed:IncludeDemoUsers and Seed:DeveloperEmail.
/// </summary>
public sealed class PostgresFixture : IAsyncLifetime
{
    public PostgreSqlContainer Container { get; } = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .WithDatabase("jaza_venus_test")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public string ConnectionString => Container.GetConnectionString();

    public async Task InitializeAsync() => await Container.StartAsync();

    public async Task DisposeAsync() => await Container.DisposeAsync();

    public WebApplicationFactory<Program> CreateFactory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.UseEnvironment("Development");
            b.ConfigureAppConfiguration((_, cfg) =>
            {
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:Default"] = ConnectionString,
                    ["Auth:RequireSuperAdminMfa"] = "false",
                    ["Seed:IncludeDemoUsers"] = "true",
                    ["Seed:SuperAdminEmail"] = "superadmin@jaza.local",
                    ["Seed:SuperAdminPassword"] = "Password123!",
                    ["Seed:DeveloperEmail"] = "developer@jaza.local",
                    ["Seed:DeveloperPassword"] = "Password123!",
                    ["Jwt:SigningKey"] = "test-only-jwt-signing-key-please-rotate-12345678",
                    ["Cookie:SecurePolicy"] = "SameAsRequest",
                });
            });
        });
}

[CollectionDefinition(nameof(PostgresCollection))]
[System.Diagnostics.CodeAnalysis.SuppressMessage("Naming", "CA1711",
    Justification = "xUnit collection-fixture marker — name is matched against the CollectionDefinition attribute.")]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture> { }
