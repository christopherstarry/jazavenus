using FluentAssertions;
using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Infrastructure.Ar;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class PaymentReceiptServiceTests
{
    [Fact]
    public async Task CreateBatchAsync_AllocatesToOpenInvoice()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var inv = new Invoice
        {
            Number = "INV-PAY",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            Status = InvoiceStatus.Posted,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 1_000m }],
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync();
        var svc = new PaymentReceiptService(db, TestDb.Audit(db));

        var result = await svc.CreateBatchAsync(new BatchPaymentRequest(
            Divisions.DistributionBdg,
            TestDb.DefaultCustomerId,
            DateTime.UtcNow,
            PaymentMethod.BankTransfer,
            "IDR",
            "REF-1",
            null,
            [new PaymentAllocationInput(inv.Id, 400m, null)]));

        result.TotalAmount.Should().Be(400m);
        result.AllocationCount.Should().Be(1);
        (await db.Invoices.SingleAsync()).Status.Should().Be(InvoiceStatus.PartiallyPaid);
        (await db.Payments.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task CreateBatchAsync_FullyPaid_SetsPaidStatus()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var inv = new Invoice
        {
            Number = "INV-FULL",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            Status = InvoiceStatus.Posted,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 500m }],
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync();
        var svc = new PaymentReceiptService(db, TestDb.Audit(db));

        await svc.CreateBatchAsync(new BatchPaymentRequest(
            Divisions.DistributionBdg, TestDb.DefaultCustomerId, DateTime.UtcNow,
            PaymentMethod.Cash, "IDR", null, null,
            [new PaymentAllocationInput(inv.Id, 500m, null)]));

        (await db.Invoices.SingleAsync()).Status.Should().Be(InvoiceStatus.Paid);
    }

    [Fact]
    public async Task CreateBatchAsync_EmptyAllocations_Throws()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var svc = new PaymentReceiptService(db, TestDb.Audit(db));

        Func<Task> act = () => svc.CreateBatchAsync(new BatchPaymentRequest(
            Divisions.DistributionBdg, TestDb.DefaultCustomerId, DateTime.UtcNow,
            PaymentMethod.Cash, "IDR", null, null, []));

        await act.Should().ThrowAsync<DomainException>().WithMessage("*At least one allocation*");
    }

    [Fact]
    public async Task CreateBatchAsync_DraftInvoice_Throws()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var inv = new Invoice
        {
            Number = "INV-DRAFT",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 100m }],
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync();
        var svc = new PaymentReceiptService(db, TestDb.Audit(db));

        Func<Task> act = () => svc.CreateBatchAsync(new BatchPaymentRequest(
            Divisions.DistributionBdg, TestDb.DefaultCustomerId, DateTime.UtcNow,
            PaymentMethod.Cash, "IDR", null, null,
            [new PaymentAllocationInput(inv.Id, 50m, null)]));

        await act.Should().ThrowAsync<DomainException>().WithMessage("*not open for payment*");
    }
}
