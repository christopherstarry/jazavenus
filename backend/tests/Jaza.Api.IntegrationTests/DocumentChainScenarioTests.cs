using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Api.Controllers.Inventory;
using Jaza.Application.Common;
using Jaza.Application.MasterData;
using Jaza.Application.Outbound;
using Jaza.Domain.Common;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class DocumentChainScenarioTests(PostgresFixture fx)
{
    [Fact]
    public async Task SalesOrder_Post_CommitsStock()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var unit = await client.PostAsJsonAsync("/api/master/units",
            new UnitUpsertDto($"U{Guid.NewGuid():N}"[..6].ToUpperInvariant(), "Each"));
        var unitId = (await unit.Content.ReadFromJsonAsync<UnitDto>())!.Id;

        var cat = await client.PostAsJsonAsync("/api/master/categories",
            new CategoryUpsertDto($"C{Guid.NewGuid():N}"[..6], "General", ParentId: null));
        var catId = (await cat.Content.ReadFromJsonAsync<CategoryDto>())!.Id;

        var item = await client.PostAsJsonAsync("/api/master/items", new ItemUpsertDto(
            $"SKU{Guid.NewGuid():N}"[..10], "Chain Item", null, null,
            catId, unitId, 20m, 80m, "IDR", ReorderLevel: null, ReorderQuantity: null));
        var itemId = (await item.Content.ReadFromJsonAsync<ItemDto>())!.Id;

        var cust = await client.PostAsJsonAsync("/api/master/customers",
            IntegrationTestClient.NewCustomer($"C{Guid.NewGuid():N}"[..8], "Chain Customer", 10_000_000m));
        var customerId = (await cust.Content.ReadFromJsonAsync<CustomerDto>())!.Id;

        var wh = await client.PostAsJsonAsync("/api/master/warehouses",
            new WarehouseUpsertDto($"W{Guid.NewGuid():N}"[..6], "Chain WH", null));
        var warehouseId = (await wh.Content.ReadFromJsonAsync<WarehouseDto>())!.Id;

        var adjust = await client.PostAsJsonAsync("/api/stock/adjustments", new StockController.AdjustmentDto(
            itemId, warehouseId, null, 50m, 20m, "seed for SO post"));
        adjust.IsSuccessStatusCode.Should().BeTrue();

        var createSo = await client.PostAsJsonAsync("/api/outbound/sales-orders", new SalesOrderUpsertDto(
            customerId, warehouseId,
            DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(3),
            "IDR", "chain test",
            [new SalesOrderUpsertLineDto(1, itemId, 10m, 80m)]));

        createSo.IsSuccessStatusCode.Should().BeTrue();
        var so = (await createSo.Content.ReadFromJsonAsync<SalesOrderDto>())!;
        so.Status.Should().Be(DocumentStatus.Draft);

        var post = await client.PostAsync($"/api/outbound/sales-orders/{so.Id}/post", content: null);
        post.IsSuccessStatusCode.Should().BeTrue();

        var posted = await client.GetFromJsonAsync<SalesOrderDto>($"/api/outbound/sales-orders/{so.Id}");
        posted!.Status.Should().Be(DocumentStatus.Posted);

        var onHand = await client.GetFromJsonAsync<PagedResult<StockController.OnHandRow>>(
            $"/api/stock/on-hand?warehouseId={warehouseId}&itemId={itemId}");
        onHand!.Items.Should().ContainSingle();
        onHand.Items[0].Quantity.Should().Be(50m);
    }

    [Fact]
    public async Task SalesOrder_Void_ReleasesCommitment()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");

        var unit = await client.PostAsJsonAsync("/api/master/units",
            new UnitUpsertDto($"U{Guid.NewGuid():N}"[..6].ToUpperInvariant(), "Each"));
        var unitId = (await unit.Content.ReadFromJsonAsync<UnitDto>())!.Id;

        var cat = await client.PostAsJsonAsync("/api/master/categories",
            new CategoryUpsertDto($"C{Guid.NewGuid():N}"[..6], "General", ParentId: null));
        var catId = (await cat.Content.ReadFromJsonAsync<CategoryDto>())!.Id;

        var item = await client.PostAsJsonAsync("/api/master/items", new ItemUpsertDto(
            $"SKU{Guid.NewGuid():N}"[..10], "Void Chain Item", null, null,
            catId, unitId, 20m, 80m, "IDR", ReorderLevel: null, ReorderQuantity: null));
        var itemId = (await item.Content.ReadFromJsonAsync<ItemDto>())!.Id;

        var cust = await client.PostAsJsonAsync("/api/master/customers",
            IntegrationTestClient.NewCustomer($"C{Guid.NewGuid():N}"[..8], "Void Chain Customer", 10_000_000m));
        var customerId = (await cust.Content.ReadFromJsonAsync<CustomerDto>())!.Id;

        var wh = await client.PostAsJsonAsync("/api/master/warehouses",
            new WarehouseUpsertDto($"W{Guid.NewGuid():N}"[..6], "Void Chain WH", null));
        var warehouseId = (await wh.Content.ReadFromJsonAsync<WarehouseDto>())!.Id;

        await client.PostAsJsonAsync("/api/stock/adjustments",
            new StockController.AdjustmentDto(itemId, warehouseId, null, 50m, 20m, "seed for void test"));

        var createSo = await client.PostAsJsonAsync("/api/outbound/sales-orders", new SalesOrderUpsertDto(
            customerId, warehouseId,
            DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(3),
            "IDR", "void chain test",
            [new SalesOrderUpsertLineDto(1, itemId, 10m, 80m)]));
        var so = (await createSo.Content.ReadFromJsonAsync<SalesOrderDto>())!;

        (await client.PostAsync($"/api/outbound/sales-orders/{so.Id}/post", content: null))
            .IsSuccessStatusCode.Should().BeTrue();

        // 10 of the 50 on-hand units are now committed (available = 40). A second SO asking for
        // 45 units must fail while SO #1's commitment is still held.
        var blockedSo = await client.PostAsJsonAsync("/api/outbound/sales-orders", new SalesOrderUpsertDto(
            customerId, warehouseId, DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(3),
            "IDR", "should be blocked", [new SalesOrderUpsertLineDto(1, itemId, 45m, 80m)]));
        var blockedSoId = (await blockedSo.Content.ReadFromJsonAsync<SalesOrderDto>())!.Id;
        (await client.PostAsync($"/api/outbound/sales-orders/{blockedSoId}/post", content: null))
            .IsSuccessStatusCode.Should().BeFalse();

        var voidResp = await client.PostAsync($"/api/outbound/sales-orders/{so.Id}/void", content: null);
        voidResp.IsSuccessStatusCode.Should().BeTrue();

        var voided = await client.GetFromJsonAsync<SalesOrderDto>($"/api/outbound/sales-orders/{so.Id}");
        voided!.Status.Should().Be(DocumentStatus.Voided);

        // After releasing the commitment, all 50 units are available again — the second SO now posts.
        (await client.PostAsync($"/api/outbound/sales-orders/{blockedSoId}/post", content: null))
            .IsSuccessStatusCode.Should().BeTrue();

        // Voided documents can no longer be voided again.
        (await client.PostAsync($"/api/outbound/sales-orders/{so.Id}/void", content: null))
            .IsSuccessStatusCode.Should().BeFalse();
    }
}
