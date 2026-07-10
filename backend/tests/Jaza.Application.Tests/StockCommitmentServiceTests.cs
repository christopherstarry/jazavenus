using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Domain.Outbound;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Stock;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class StockCommitmentServiceTests
{
    [Fact]
    public async Task CommitAsync_PostedOrder_ReservesOpenQuantity()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var soId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        db.StockOnHand.Add(new StockOnHand
        {
            ItemId = TestDb.DefaultItemId,
            WarehouseId = TestDb.DefaultWarehouseId,
            Quantity = 20,
            AverageCost = 5,
            LastMovementAtUtc = DateTime.UtcNow,
        });
        db.SalesOrders.Add(new SalesOrder
        {
            Id = soId,
            Number = "SO-001",
            Division = Divisions.DistributionBdg,
            Status = DocumentStatus.Posted,
            CustomerId = TestDb.DefaultCustomerId,
            WarehouseId = TestDb.DefaultWarehouseId,
            OrderDate = DateTime.UtcNow,
            Lines =
            [
                new SalesOrderLine
                {
                    LineNumber = 1,
                    ItemId = TestDb.DefaultItemId,
                    Quantity = 10,
                    UnitPrice = 100,
                },
            ],
        });
        await db.SaveChangesAsync();
        var svc = new StockCommitmentService(db);

        await svc.CommitAsync(soId);

        var soh = await db.StockOnHand.SingleAsync();
        soh.CommittedQuantity.Should().Be(10);
        var line = await db.SalesOrderLines.SingleAsync();
        line.QuantityCommitted.Should().Be(10);
    }

    [Fact]
    public async Task CommitAsync_DraftOrder_Throws()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var soId = Guid.NewGuid();
        db.SalesOrders.Add(new SalesOrder
        {
            Id = soId,
            Number = "SO-DRAFT",
            CustomerId = TestDb.DefaultCustomerId,
            WarehouseId = TestDb.DefaultWarehouseId,
            OrderDate = DateTime.UtcNow,
            Lines = [new SalesOrderLine { LineNumber = 1, ItemId = TestDb.DefaultItemId, Quantity = 1, UnitPrice = 1 }],
        });
        await db.SaveChangesAsync();
        var svc = new StockCommitmentService(db);

        Func<Task> act = () => svc.CommitAsync(soId);
        await act.Should().ThrowAsync<DomainException>().WithMessage("*Only posted*");
    }

    [Fact]
    public async Task CommitAsync_InsufficientStock_Throws()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var soId = Guid.NewGuid();
        db.StockOnHand.Add(new StockOnHand
        {
            ItemId = TestDb.DefaultItemId,
            WarehouseId = TestDb.DefaultWarehouseId,
            Quantity = 2,
            CommittedQuantity = 1,
            AverageCost = 1,
            LastMovementAtUtc = DateTime.UtcNow,
        });
        db.SalesOrders.Add(new SalesOrder
        {
            Id = soId,
            Number = "SO-LOW",
            Status = DocumentStatus.Posted,
            CustomerId = TestDb.DefaultCustomerId,
            WarehouseId = TestDb.DefaultWarehouseId,
            OrderDate = DateTime.UtcNow,
            Lines = [new SalesOrderLine { LineNumber = 1, ItemId = TestDb.DefaultItemId, Quantity = 5, UnitPrice = 1 }],
        });
        await db.SaveChangesAsync();
        var svc = new StockCommitmentService(db);

        Func<Task> act = () => svc.CommitAsync(soId);
        await act.Should().ThrowAsync<DomainException>().WithMessage("*Insufficient available stock*");
    }

    [Fact]
    public async Task ReleaseAsync_ClearsCommittedQuantity()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var soId = Guid.NewGuid();
        db.StockOnHand.Add(new StockOnHand
        {
            ItemId = TestDb.DefaultItemId,
            WarehouseId = TestDb.DefaultWarehouseId,
            Quantity = 10,
            CommittedQuantity = 4,
            AverageCost = 1,
            LastMovementAtUtc = DateTime.UtcNow,
        });
        db.SalesOrders.Add(new SalesOrder
        {
            Id = soId,
            Number = "SO-REL",
            Status = DocumentStatus.Posted,
            CustomerId = TestDb.DefaultCustomerId,
            WarehouseId = TestDb.DefaultWarehouseId,
            OrderDate = DateTime.UtcNow,
            Lines =
            [
                new SalesOrderLine
                {
                    LineNumber = 1,
                    ItemId = TestDb.DefaultItemId,
                    Quantity = 4,
                    QuantityCommitted = 4,
                    UnitPrice = 1,
                },
            ],
        });
        await db.SaveChangesAsync();
        var svc = new StockCommitmentService(db);

        await svc.ReleaseAsync(soId);

        var soh = await db.StockOnHand.SingleAsync();
        soh.CommittedQuantity.Should().Be(0);
        (await db.SalesOrderLines.SingleAsync()).QuantityCommitted.Should().Be(0);
    }

    [Fact]
    public async Task GetAvailableQuantityAsync_ReturnsOnHandMinusCommitted()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        db.StockOnHand.Add(new StockOnHand
        {
            ItemId = TestDb.DefaultItemId,
            WarehouseId = TestDb.DefaultWarehouseId,
            Quantity = 15,
            CommittedQuantity = 6,
            AverageCost = 1,
            LastMovementAtUtc = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
        var svc = new StockCommitmentService(db);

        var available = await svc.GetAvailableQuantityAsync(TestDb.DefaultItemId, TestDb.DefaultWarehouseId);

        available.Should().Be(9);
    }
}
