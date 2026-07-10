using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.Reports;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class SalesReportsEndpointsTests(PostgresFixture fx)
{
    [Fact]
    public async Task DailySales_ReturnsReportQueryResult()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local", "Password123!");

        var result = await client.GetFromJsonAsync<ReportQueryResult>(
            "/api/reports/sales/daily-sales?page=1&pageSize=20");

        result.Should().NotBeNull();
        result!.ReportKey.Should().Be("sales:daily-sales");
        result.Rows.Should().NotBeNull();
    }

    [Fact]
    public async Task SalesOrderRegister_ReturnsReportQueryResult()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local", "Password123!");

        var result = await client.GetFromJsonAsync<ReportQueryResult>(
            "/api/reports/sales/sales-order-register?page=1&pageSize=20");

        result.Should().NotBeNull();
        result!.ReportKey.Should().Be("sales:sales-order-register");
    }
}
