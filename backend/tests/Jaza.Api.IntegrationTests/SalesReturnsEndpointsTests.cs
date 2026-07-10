using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.MasterData;
using Jaza.Application.Returns;
using Jaza.Domain.Common;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class SalesReturnsEndpointsTests(PostgresFixture fx)
{
    [Fact]
    public async Task List_ReturnsOk()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var resp = await client.GetAsync("/api/outbound/sales-returns?page=1&pageSize=10");

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateDraftReturn_ThenGet_ReturnsDocument()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");
        var master = await SeedMasterAsync(client);

        var create = await client.PostAsJsonAsync("/api/outbound/sales-returns", new SalesReturnUpsertDto(
            CustomerId: master.CustomerId,
            WarehouseId: master.WarehouseId,
            DeliveryOrderId: null,
            InvoiceId: null,
            ReturnCode: null,
            ReturnDate: DateTime.UtcNow.Date,
            Notes: "integration test",
            Lines:
            [
                new SalesReturnUpsertLineDto(
                    LineNumber: 1, BaseDocumentType: null, BaseDocumentId: null,
                    BaseLineNumber: null, BaseQuantity: null,
                    ItemId: master.ItemId, LocationId: null,
                    Quantity: 1, UnitPrice: 100m),
            ]));

        create.IsSuccessStatusCode.Should().BeTrue();
        var doc = await create.Content.ReadFromJsonAsync<SalesReturnDto>();
        doc!.Status.Should().Be(DocumentStatus.Draft);

        var get = await client.GetAsync($"/api/outbound/sales-returns/{doc.Id}");
        get.IsSuccessStatusCode.Should().BeTrue();
    }

    [Fact]
    public async Task Post_WithoutStock_ReturnsError()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");
        var master = await SeedMasterAsync(client);

        var create = await client.PostAsJsonAsync("/api/outbound/sales-returns", new SalesReturnUpsertDto(
            master.CustomerId, master.WarehouseId, null, null, null, DateTime.UtcNow.Date, null,
            [new SalesReturnUpsertLineDto(1, null, null, null, null, master.ItemId, null, 1, 50m)]));
        var doc = (await create.Content.ReadFromJsonAsync<SalesReturnDto>())!;

        var post = await client.PostAsync($"/api/outbound/sales-returns/{doc.Id}/post", content: null);
        post.IsSuccessStatusCode.Should().BeFalse();
    }

    private static async Task<(Guid CustomerId, Guid ItemId, Guid WarehouseId)> SeedMasterAsync(HttpClient client)
    {
        var unit = await client.PostAsJsonAsync("/api/master/units",
            new UnitUpsertDto($"U{Guid.NewGuid():N}"[..6].ToUpperInvariant(), "Each"));
        var unitId = (await unit.Content.ReadFromJsonAsync<UnitDto>())!.Id;

        var cat = await client.PostAsJsonAsync("/api/master/categories",
            new CategoryUpsertDto($"C{Guid.NewGuid():N}"[..6], "General", ParentId: null));
        var catId = (await cat.Content.ReadFromJsonAsync<CategoryDto>())!.Id;

        var item = await client.PostAsJsonAsync("/api/master/items", new ItemUpsertDto(
            $"SKU{Guid.NewGuid():N}"[..10], "Test Item", null, null,
            catId, unitId, 10m, 100m, "IDR", ReorderLevel: null, ReorderQuantity: null));
        var itemId = (await item.Content.ReadFromJsonAsync<ItemDto>())!.Id;

        var cust = await client.PostAsJsonAsync("/api/master/customers",
            IntegrationTestClient.NewCustomer($"C{Guid.NewGuid():N}"[..8], "Return Customer", 1_000_000m));
        var customerId = (await cust.Content.ReadFromJsonAsync<CustomerDto>())!.Id;

        var wh = await client.PostAsJsonAsync("/api/master/warehouses",
            new WarehouseUpsertDto($"W{Guid.NewGuid():N}"[..6], "WH", null));
        var warehouseId = (await wh.Content.ReadFromJsonAsync<WarehouseDto>())!.Id;

        return (customerId, itemId, warehouseId);
    }
}
