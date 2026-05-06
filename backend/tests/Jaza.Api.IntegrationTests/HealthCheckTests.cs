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
        HttpResponseMessage? resp = null;

        for (var i = 0; i < 10; i++)
        {
            resp = await client.GetAsync("/health");
            if (resp.IsSuccessStatusCode) break;
            await Task.Delay(250);
        }

        resp!.IsSuccessStatusCode.Should().BeTrue($"last status was {resp.StatusCode}");
    }
}
