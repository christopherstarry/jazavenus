using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Application.Settings;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class SettingsEndpointsTests(PostgresFixture fx)
{
    [Fact]
    public async Task ListOrderCodes_ReturnsPagedResult()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var resp = await client.GetAsync("/api/settings/order-codes?page=1&pageSize=10");

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await resp.Content.ReadFromJsonAsync<PagedResult<OrderCodeDto>>();
        body.Should().NotBeNull();
        body!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task CompanySettings_PutThenGet_RoundTrips()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var put = await client.PutAsJsonAsync("/api/settings/company", new CompanySettingsUpsertDto(
            CompanyName: "Jaza Test Co",
            Address: "Jl. Test 1",
            City: "Bandung",
            Phone: "021-000",
            Fax: null,
            NpwpNumber: "01.234.567.8-901.000",
            PkpNumber: null,
            DefaultCurrency: "IDR",
            SettingsJson: null));

        put.IsSuccessStatusCode.Should().BeTrue();
        var saved = await put.Content.ReadFromJsonAsync<CompanySettingsDto>();
        saved!.CompanyName.Should().Be("Jaza Test Co");
        saved.Division.Should().Be(Divisions.DistributionBdg);

        var get = await client.GetFromJsonAsync<CompanySettingsDto>("/api/settings/company");
        get!.CompanyName.Should().Be("Jaza Test Co");
    }

    [Fact]
    public async Task CreateFiscalPeriod_ThenList_IncludesNewPeriod()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var create = await client.PostAsJsonAsync("/api/settings/fiscal-periods", new FiscalPeriodUpsertDto(
            Year: 2099, Month: 1,
            StartDate: new DateTime(2099, 1, 1),
            EndDate: new DateTime(2099, 1, 31)));

        create.IsSuccessStatusCode.Should().BeTrue();
        var created = await create.Content.ReadFromJsonAsync<FiscalPeriodDto>();
        created!.Year.Should().Be(2099);

        var list = await client.GetFromJsonAsync<PagedResult<FiscalPeriodDto>>(
            "/api/settings/fiscal-periods?page=1&pageSize=50");
        list!.Items.Should().Contain(x => x.Id == created.Id);
    }

    [Fact]
    public async Task CreateReturnCode_ReturnsCreatedDto()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var code = $"RT{Guid.NewGuid():N}"[..8].ToUpperInvariant();
        var resp = await client.PostAsJsonAsync("/api/settings/return-codes", new ReturnCodeUpsertDto(
            Code: code, Name: "Damaged goods", Description: "Integration test", IsActive: true));

        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await resp.Content.ReadFromJsonAsync<ReturnCodeDto>();
        body!.Code.Should().Be(code);
    }
}
