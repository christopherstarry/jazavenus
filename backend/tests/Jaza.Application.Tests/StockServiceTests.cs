using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Jaza.Infrastructure.Stock;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class StockServiceTests
{
    [Fact]
    public async Task PostMovement_PositiveQty_CreatesOnHandRow()
    {
        await using var db = NewDb();
        var svc = new StockService(db);

        await svc.PostMovementAsync(NewMovement(qty: 10, cost: 5));
        await db.SaveChangesAsync();

        var soh = await db.StockOnHand.SingleAsync();
        soh.Quantity.Should().Be(10);
        soh.AverageCost.Should().Be(5);
    }

    [Fact]
    public async Task PostMovement_TwoReceipts_RecomputesAverageCost()
    {
        await using var db = NewDb();
        var svc = new StockService(db);

        await svc.PostMovementAsync(NewMovement(qty: 10, cost: 5));
        await db.SaveChangesAsync();
        await svc.PostMovementAsync(NewMovement(qty: 10, cost: 7));
        await db.SaveChangesAsync();

        var soh = await db.StockOnHand.SingleAsync();
        soh.Quantity.Should().Be(20);
        soh.AverageCost.Should().Be(6m); // (50 + 70) / 20
    }

    [Fact]
    public async Task PostMovement_NegativeBeyondOnHand_Throws()
    {
        await using var db = NewDb();
        var svc = new StockService(db);

        await svc.PostMovementAsync(NewMovement(qty: 5, cost: 1));
        await db.SaveChangesAsync();

        Func<Task> act = async () =>
        {
            await svc.PostMovementAsync(NewMovement(qty: -6, cost: 1));
            await db.SaveChangesAsync();
        };
        await act.Should().ThrowAsync<DomainException>().WithMessage("*Insufficient stock*");
    }

    private static AppDbContext NewDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(opts);
        return db;
    }

    private static StockMovement NewMovement(decimal qty, decimal cost) => new()
    {
        ItemId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
        WarehouseId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Quantity = qty, UnitCost = cost,
        OccurredAtUtc = DateTime.UtcNow,
        SourceDocumentType = "Test", SourceDocumentId = Guid.NewGuid(),
        Type = qty >= 0 ? StockMovementType.GoodsReceipt : StockMovementType.GoodsIssue,
    };
}
