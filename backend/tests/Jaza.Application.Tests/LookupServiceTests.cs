using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Lookup;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class LookupServiceTests
{
    [Fact]
    public void SupportedTypes_ContainsCoreMasters()
    {
        using var db = TestDb.New();
        var svc = new LookupService(db, new FakeDivisionScope());
        svc.SupportedTypes.Should().Contain("customers");
        svc.SupportedTypes.Should().Contain("items");
        svc.SupportedTypes.Should().Contain("sales-orders");
    }

    [Fact]
    public async Task Search_UnknownType_Throws()
    {
        await using var db = TestDb.New();
        var svc = new LookupService(db, new FakeDivisionScope());

        Func<Task> act = () => svc.SearchAsync("not-real", null, null, 1, 20);
        await act.Should().ThrowAsync<DomainException>().WithMessage("*Unknown lookup type*");
    }

    [Fact]
    public async Task Search_Customers_ReturnsActiveRows()
    {
        await using var db = TestDb.New();
        db.Customers.AddRange(
            new Customer { Code = "A1", Name = "Alpha Store", City = "Jakarta", IsActive = true },
            new Customer { Code = "B2", Name = "Beta", IsActive = false });
        await db.SaveChangesAsync();

        var svc = new LookupService(db, new FakeDivisionScope());
        var result = await svc.SearchAsync("customers", "Alpha", null, 1, 20);

        result.Type.Should().Be("customers");
        result.TotalCount.Should().Be(1);
        result.Items.Single().Code.Should().Be("A1");
    }

    [Fact]
    public async Task Search_Items_FiltersBySku()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var svc = new LookupService(db, new FakeDivisionScope());

        var result = await svc.SearchAsync("items", "SKU-001", null, 1, 20);

        result.TotalCount.Should().Be(1);
        result.Items.Single().Id.Should().Be(TestDb.DefaultItemId);
    }

    [Fact]
    public async Task Search_ClampsPageSize_To200()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var svc = new LookupService(db, new FakeDivisionScope());

        var result = await svc.SearchAsync("customers", null, null, 1, 500);

        result.Items.Count.Should().BeLessThanOrEqualTo(200);
    }
}
