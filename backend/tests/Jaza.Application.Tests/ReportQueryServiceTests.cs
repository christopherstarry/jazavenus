using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Application.Reports;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Reports;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class ReportQueryServiceTests
{
    [Fact]
    public void AvailableReports_ContainsKnownKeys()
    {
        using var db = TestDb.New();
        var svc = new ReportQueryService(db, new FakeDivisionScope());

        svc.AvailableReports.Should().Contain("sales:sales-report");
        svc.AvailableReports.Should().Contain("inventory:stock-position");
        svc.AvailableReports.Should().Contain("purchase:purchase-report");
    }

    [Fact]
    public async Task ExecuteAsync_SalesReport_ReturnsResult()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        db.Invoices.Add(new Invoice
        {
            Number = "INV-RPT",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            Status = InvoiceStatus.Posted,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines =
            [
                new InvoiceLine
                {
                    LineNumber = 1,
                    ItemId = TestDb.DefaultItemId,
                    Description = "Item",
                    Quantity = 2,
                    UnitPrice = 100,
                },
            ],
        });
        await db.SaveChangesAsync();

        var svc = new ReportQueryService(db, new FakeDivisionScope());
        var result = await svc.ExecuteAsync(new ReportQueryRequest(
            "sales:sales-report", null, null, null, null, null, null, null));

        result.ReportKey.Should().Be("sales:sales-report");
        result.Rows.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ExecuteAsync_InventoryStockPosition_ReturnsResult()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        db.StockOnHand.Add(new StockOnHand
        {
            ItemId = TestDb.DefaultItemId,
            WarehouseId = TestDb.DefaultWarehouseId,
            Quantity = 12,
            AverageCost = 4,
            LastMovementAtUtc = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

        var svc = new ReportQueryService(db, new FakeDivisionScope());
        var result = await svc.ExecuteAsync(new ReportQueryRequest(
            "inventory:stock-position", null, null, null, null, null, null, null));

        result.ReportKey.Should().Be("inventory:stock-position");
        result.TotalCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ExecuteAsync_PurchaseReport_ReturnsResult()
    {
        await using var db = TestDb.New();
        var svc = new ReportQueryService(db, new FakeDivisionScope());

        var result = await svc.ExecuteAsync(new ReportQueryRequest(
            "purchase:purchase-report", null, null, null, null, null, null, null));

        result.ReportKey.Should().Be("purchase:purchase-report");
        result.Rows.Should().NotBeNull();
    }

    [Fact]
    public async Task ExecuteAsync_InvalidKey_Throws()
    {
        await using var db = TestDb.New();
        var svc = new ReportQueryService(db, new FakeDivisionScope());

        Func<Task> act = () => svc.ExecuteAsync(new ReportQueryRequest(
            "not-a-valid-key", null, null, null, null, null, null, null));

        await act.Should().ThrowAsync<DomainException>().WithMessage("*Invalid report key*");
    }
}
