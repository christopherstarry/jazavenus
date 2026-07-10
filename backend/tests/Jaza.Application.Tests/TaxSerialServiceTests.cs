using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Tax;
using Jaza.Infrastructure.Tax;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class TaxSerialServiceTests
{
    [Fact]
    public async Task CustomerRequiresTaxSerialAsync_False_WhenNoPkp()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var svc = new TaxSerialService(db, TestDb.Audit(db));

        var requires = await svc.CustomerRequiresTaxSerialAsync(TestDb.DefaultCustomerId);

        requires.Should().BeFalse();
    }

    [Fact]
    public async Task CustomerRequiresTaxSerialAsync_True_WhenPkpPresent()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, pkpNumber: "PKP-123");
        var svc = new TaxSerialService(db, TestDb.Audit(db));

        var requires = await svc.CustomerRequiresTaxSerialAsync(TestDb.DefaultCustomerId);

        requires.Should().BeTrue();
    }

    [Fact]
    public async Task AllocateForInvoiceAsync_AllocatesLowestAvailableSerial()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, pkpNumber: "PKP-123");
        var taxReg = new TaxRegistration { Code = "NPWP1", Name = "Main" };
        db.TaxRegistrations.Add(taxReg);
        db.TaxInvoiceSerials.AddRange(
            new TaxInvoiceSerial { Division = Divisions.DistributionBdg, TaxRegistrationId = taxReg.Id, SerialNumber = "010.000-26.00000002" },
            new TaxInvoiceSerial { Division = Divisions.DistributionBdg, TaxRegistrationId = taxReg.Id, SerialNumber = "010.000-26.00000001" });
        var inv = new Invoice
        {
            Number = "INV-TAX",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 100m }],
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync();
        var svc = new TaxSerialService(db, TestDb.Audit(db));

        var serial = await svc.AllocateForInvoiceAsync(inv.Id);

        serial.Should().Be("010.000-26.00000001");
        (await db.Invoices.SingleAsync()).TaxSerial.Should().Be("010.000-26.00000001");
        (await db.TaxInvoiceSerials.SingleAsync(s => s.SerialNumber == "010.000-26.00000001")).Status
            .Should().Be(TaxSerialStatus.Used);
    }

    [Fact]
    public async Task AllocateForInvoiceAsync_ReturnsExisting_WhenAlreadySet()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, pkpNumber: "PKP-123");
        var inv = new Invoice
        {
            Number = "INV-EXIST",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            TaxSerial = "010.000-26.99999999",
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 1m }],
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync();
        var svc = new TaxSerialService(db, TestDb.Audit(db));

        var serial = await svc.AllocateForInvoiceAsync(inv.Id);

        serial.Should().Be("010.000-26.99999999");
        db.TaxInvoiceSerials.Should().BeEmpty();
    }

    [Fact]
    public async Task AllocateForInvoiceAsync_NoPool_Throws()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, pkpNumber: "PKP-123");
        var inv = new Invoice
        {
            Number = "INV-NOPOOL",
            Division = Divisions.DistributionBdg,
            CustomerId = TestDb.DefaultCustomerId,
            IssueDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Lines = [new InvoiceLine { LineNumber = 1, Description = "Line", Quantity = 1, UnitPrice = 1m }],
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync();
        var svc = new TaxSerialService(db, TestDb.Audit(db));

        Func<Task> act = () => svc.AllocateForInvoiceAsync(inv.Id);
        await act.Should().ThrowAsync<DomainException>().WithMessage("*No tax invoice serial available*");
    }

}
