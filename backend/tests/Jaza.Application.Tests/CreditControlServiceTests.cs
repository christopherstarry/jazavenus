using FluentAssertions;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Credit;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class CreditControlServiceTests
{
    [Fact]
    public async Task CheckAsync_WithinCreditLimit_Allows()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, creditLimit: 10_000m);
        var svc = new CreditControlService(db);

        var result = await svc.CheckAsync(TestDb.DefaultCustomerId, 5_000m);

        result.Allowed.Should().BeTrue();
        result.Reason.Should().BeNull();
        result.CurrentExposure.Should().Be(5_000m);
    }

    [Fact]
    public async Task CheckAsync_ExceedsCreditLimit_Denies()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, creditLimit: 1_000m);
        var svc = new CreditControlService(db);

        var result = await svc.CheckAsync(TestDb.DefaultCustomerId, 1_500m);

        result.Allowed.Should().BeFalse();
        result.Reason.Should().Be("Credit limit exceeded.");
    }

    [Fact]
    public async Task CheckAsync_AdminOverride_BypassesLimit()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, creditLimit: 100m);
        var svc = new CreditControlService(db);

        var result = await svc.CheckAsync(TestDb.DefaultCustomerId, 9_999m, adminOverride: true);

        result.Allowed.Should().BeTrue();
    }

    [Fact]
    public async Task CheckAsync_IncludesOpenInvoiceExposure()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, creditLimit: 1_000m);
        db.Invoices.Add(new Invoice
        {
            Number = "INV-001",
            CustomerId = TestDb.DefaultCustomerId,
            Status = InvoiceStatus.Posted,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines =
            [
                new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 600m },
            ],
        });
        await db.SaveChangesAsync();
        var svc = new CreditControlService(db);

        var result = await svc.CheckAsync(TestDb.DefaultCustomerId, 500m);

        result.Allowed.Should().BeFalse();
        result.CurrentExposure.Should().Be(1_100m);
    }

    [Fact]
    public async Task HasOverdueInvoicesAsync_ReturnsTrue_WhenPastDue()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        db.Invoices.Add(new Invoice
        {
            Number = "INV-OVD",
            CustomerId = TestDb.DefaultCustomerId,
            Status = InvoiceStatus.Posted,
            IssueDate = DateTime.UtcNow.Date.AddMonths(-2),
            DueDate = DateTime.UtcNow.Date.AddDays(-1),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 100m }],
        });
        await db.SaveChangesAsync();
        var svc = new CreditControlService(db);

        var overdue = await svc.HasOverdueInvoicesAsync(TestDb.DefaultCustomerId);

        overdue.Should().BeTrue();
    }

    [Fact]
    public async Task CheckAsync_OverdueInvoices_DeniesWithoutOverride()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, creditLimit: 0);
        db.Invoices.Add(new Invoice
        {
            Number = "INV-OVD2",
            CustomerId = TestDb.DefaultCustomerId,
            Status = InvoiceStatus.PartiallyPaid,
            IssueDate = DateTime.UtcNow.Date.AddMonths(-1),
            DueDate = DateTime.UtcNow.Date.AddDays(-5),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 50m }],
        });
        await db.SaveChangesAsync();
        var svc = new CreditControlService(db);

        var result = await svc.CheckAsync(TestDb.DefaultCustomerId, 10m);

        result.Allowed.Should().BeFalse();
        result.Reason.Should().Be("Customer has overdue invoices.");
    }
}
