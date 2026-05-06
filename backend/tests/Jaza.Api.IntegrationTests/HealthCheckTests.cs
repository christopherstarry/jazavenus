using FluentAssertions;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class HealthCheckTests(PostgresFixture fx)
{
    [Fact]
    public async Task Health_Returns_200()
    {
        var client = fx.CreateFactory().CreateClient();
        var resp = await client.GetAsync("/health");
        resp.IsSuccessStatusCode.Should().BeTrue();
    }
}
