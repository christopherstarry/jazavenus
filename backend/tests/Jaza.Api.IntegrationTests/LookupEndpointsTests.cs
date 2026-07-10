using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.Lookup;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class LookupEndpointsTests(PostgresFixture fx)
{
    [Fact]
    public async Task ListTypes_ReturnsSupportedLookupTypes()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local", "Password123!");

        var types = await client.GetFromJsonAsync<IReadOnlyList<string>>("/api/lookup/types");

        types.Should().NotBeNull();
        types!.Should().Contain("customers");
        types.Should().Contain("items");
    }

    [Fact]
    public async Task SearchCustomers_ReturnsLookupResult()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local", "Password123!");

        var result = await client.GetFromJsonAsync<LookupResult>("/api/lookup/customers?page=1&pageSize=20");

        result.Should().NotBeNull();
        result!.Type.Should().Be("customers");
        result.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task SearchUnknownType_ReturnsError()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local", "Password123!");

        var resp = await client.GetAsync("/api/lookup/not-a-real-type");

        resp.IsSuccessStatusCode.Should().BeFalse();
    }
}
