using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Domain.Returns;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Returns;
using Jaza.Infrastructure.Stock;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class ReturnsServiceTests
{
    [Fact]
    public async Task PostSalesReturnAsync_Draft_SetsPostedAndAddsStock()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var stock = new StockService(db);
        await stock.PostMovementAsync(new StockMovement
        {
            Type = StockMovementType.GoodsReceipt,
            ItemId = TestDb.DefaultItemId,
            WarehouseId = TestDb.DefaultWarehouseId,
            Quantity = 5,
            UnitCost = 10,
            OccurredAtUtc = DateTime.UtcNow,
            SourceDocumentType = "Seed",
            SourceDocumentId = Guid.NewGuid(),
        });
        await db.SaveChangesAsync();

        var retId = Guid.NewGuid();
        db.SalesReturns.Add(new SalesReturn
        {
            Id = retId,
            Number = "SR-001",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            WarehouseId = TestDb.DefaultWarehouseId,
            ReturnDate = DateTime.UtcNow,
            Lines =
            [
                new SalesReturnLine
                {
                    LineNumber = 1,
                    ItemId = TestDb.DefaultItemId,
                    Quantity = 2,
                    UnitPrice = 100,
                },
            ],
        });
        await db.SaveChangesAsync();
        var svc = new ReturnsService(db, stock, TestDb.Audit(db));

        await svc.PostSalesReturnAsync(retId);

        (await db.SalesReturns.SingleAsync()).Status.Should().Be(DocumentStatus.Posted);
        (await db.StockOnHand.SingleAsync()).Quantity.Should().Be(7);
    }

    [Fact]
    public async Task PostSalesReturnAsync_AlreadyPosted_Throws()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var retId = Guid.NewGuid();
        db.SalesReturns.Add(new SalesReturn
        {
            Id = retId,
            Number = "SR-POSTED",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            WarehouseId = TestDb.DefaultWarehouseId,
            ReturnDate = DateTime.UtcNow,
            Status = DocumentStatus.Posted,
            Lines = [new SalesReturnLine { LineNumber = 1, ItemId = TestDb.DefaultItemId, Quantity = 1, UnitPrice = 1 }],
        });
        await db.SaveChangesAsync();
        var svc = new ReturnsService(db, new StockService(db), TestDb.Audit(db));

        Func<Task> act = () => svc.PostSalesReturnAsync(retId);
        await act.Should().ThrowAsync<DomainException>().WithMessage("*already posted*");
    }

    [Fact]
    public async Task PostCreditMemoAsync_Draft_SetsPosted()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var memoId = Guid.NewGuid();
        db.CreditMemos.Add(new CreditMemo
        {
            Id = memoId,
            Number = "CM-001",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            IssueDate = DateTime.UtcNow,
            Lines =
            [
                new CreditMemoLine
                {
                    LineNumber = 1,
                    Description = "Adjustment",
                    Quantity = 1,
                    UnitPrice = 50,
                },
            ],
        });
        await db.SaveChangesAsync();
        var svc = new ReturnsService(db, new StockService(db), TestDb.Audit(db));

        await svc.PostCreditMemoAsync(memoId);

        (await db.CreditMemos.SingleAsync()).Status.Should().Be(DocumentStatus.Posted);
    }
}
