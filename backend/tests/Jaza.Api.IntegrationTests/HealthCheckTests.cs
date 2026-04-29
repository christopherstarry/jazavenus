using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Jaza.Api.IntegrationTests;

/// <summary>
/// Smoke test placeholder. Real integration tests should use the Testcontainers.MsSql package
/// to spin up SQL Server in Docker for each test class.
/// </summary>
public sealed class HealthCheckTests
{
    [Fact(Skip = "Requires running SQL Server. Enable when CI has Docker configured.")]
    public async Task Health_Returns_200()
    {
        await using var factory = new WebApplicationFactory<Program>();
        var client = factory.CreateClient();
        var resp = await client.GetAsync("/health");
        resp.IsSuccessStatusCode.Should().BeTrue();
    }
}
