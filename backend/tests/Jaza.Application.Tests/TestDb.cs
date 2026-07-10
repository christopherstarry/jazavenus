using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Jaza.Application.Tests;

internal static class TestDb
{
    public static AppDbContext New() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options);

    public static readonly Guid DefaultCustomerId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid DefaultItemId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid DefaultWarehouseId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    public static readonly Guid DefaultCategoryId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
    public static readonly Guid DefaultUnitId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");

    public static IActionAuditService Audit(AppDbContext db) =>
        new Jaza.Infrastructure.Persistence.ActionAuditService(db, new FakeCurrentUser());

    public static async Task SeedMasterAsync(AppDbContext db, decimal creditLimit = 0, string? pkpNumber = null,
        string? discountCode = null)
    {
        db.Units.Add(new Unit { Id = DefaultUnitId, Code = "EA", Name = "Each" });
        db.Categories.Add(new ItemCategory { Id = DefaultCategoryId, Code = "GEN", Name = "General" });
        db.Items.Add(new Item
        {
            Id = DefaultItemId,
            Sku = "SKU-001",
            Name = "Test Item",
            CategoryId = DefaultCategoryId,
            UnitId = DefaultUnitId,
            StandardCost = 50m,
            StandardPrice = 100m,
        });
        db.Warehouses.Add(new Warehouse
        {
            Id = DefaultWarehouseId,
            Code = "WH01",
            Name = "Main Warehouse",
        });
        db.Customers.Add(new Customer
        {
            Id = DefaultCustomerId,
            Code = "CUST01",
            Name = "Test Customer",
            CreditLimit = creditLimit,
            PKPNumber = pkpNumber,
            DiscountCode = discountCode,
        });
        await db.SaveChangesAsync();
    }
}

internal sealed class FakeCurrentUser : ICurrentUser
{
    public Guid? UserId { get; init; } = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff");
    public string? UserName { get; init; } = "test-user";
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public bool IsAuthenticated { get; init; } = true;
    private readonly HashSet<string> _roles = [];

    public void WithRole(string role) => _roles.Add(role);
    public bool IsInRole(string role) => _roles.Contains(role);
}

internal sealed class FakeDivisionScope(string? division = null) : IDivisionScopeService
{
    public bool CanAccessAllDivisions { get; init; } = division is null;
    public string? EffectiveDivision { get; init; } = division;

    public string RequireDivisionForWrite() =>
        EffectiveDivision ?? throw new DomainException("Division required.");

    public IQueryable<T> ApplyDivisionFilter<T>(IQueryable<T> query, Func<T, string> divisionSelector)
        where T : class
    {
        if (EffectiveDivision is null) return query;
        return query.Where(e => divisionSelector(e) == EffectiveDivision);
    }

    public void EnsureDivisionAccess(string? documentDivision)
    {
        if (EffectiveDivision is null) return;
        if (!EffectiveDivision.Equals(documentDivision, StringComparison.OrdinalIgnoreCase))
            throw new DomainException("Access denied for this division.");
    }
}
