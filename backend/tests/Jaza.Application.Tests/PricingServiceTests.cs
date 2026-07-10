using FluentAssertions;
using Jaza.Domain.MasterData;
using Jaza.Domain.Pricing;
using Jaza.Infrastructure.Pricing;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class PricingServiceTests
{
    [Fact]
    public async Task ResolveAsync_UsesStandardPrice_WhenNoItemPrice()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var svc = new PricingService(db);

        var result = await svc.ResolveAsync(TestDb.DefaultCustomerId, TestDb.DefaultItemId, 1, DateTime.UtcNow);

        result.UnitPrice.Should().Be(100m);
        result.Discount1Percent.Should().Be(0);
    }

    [Fact]
    public async Task ResolveAsync_PrefersActiveItemPrice()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var tier = new PriceTier { Code = "T1", Name = "Tier 1" };
        db.PriceTiers.Add(tier);
        db.ItemPrices.Add(new ItemPrice { ItemId = TestDb.DefaultItemId, PriceTierId = tier.Id, Price = 120m });
        await db.SaveChangesAsync();
        var svc = new PricingService(db);

        var result = await svc.ResolveAsync(TestDb.DefaultCustomerId, TestDb.DefaultItemId, 1, DateTime.UtcNow);

        result.UnitPrice.Should().Be(120m);
    }

    [Fact]
    public async Task ResolveAsync_AppliesItemDiscount()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        var dc = new DiscountCode { Code = "D1", Name = "Discount 1" };
        db.DiscountCodes.Add(dc);
        db.ItemDiscounts.Add(new ItemDiscount
        {
            ItemId = TestDb.DefaultItemId,
            DiscountCodeId = dc.Id,
            DiscountPercent = 5m,
        });
        await db.SaveChangesAsync();
        var svc = new PricingService(db);

        var result = await svc.ResolveAsync(TestDb.DefaultCustomerId, TestDb.DefaultItemId, 1, DateTime.UtcNow);

        result.Discount1Percent.Should().Be(5m);
    }

    [Fact]
    public async Task ResolveAsync_AppliesBrandDiscount()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db);
        db.BrandDiscounts.Add(new BrandDiscount
        {
            CustomerId = TestDb.DefaultCustomerId,
            BrandCode = "BR01",
            DiscountPercent = 7m,
            DiscountPercent2 = 3m,
        });
        await db.SaveChangesAsync();
        var svc = new PricingService(db);

        var result = await svc.ResolveAsync(TestDb.DefaultCustomerId, TestDb.DefaultItemId, 1, DateTime.UtcNow);

        result.Discount2Percent.Should().Be(7m);
        result.Discount3Percent.Should().Be(3m);
    }

    [Fact]
    public async Task ResolveAsync_AppliesExtraDiscountFromCustomerCode()
    {
        await using var db = TestDb.New();
        await TestDb.SeedMasterAsync(db, discountCode: "EXTRA1");
        var extra = new ExtraDiscount
        {
            Code = "EXTRA1",
            Name = "Promo",
            EffectiveFrom = DateTime.UtcNow.AddDays(-1),
            Lines =
            [
                new ExtraDiscountLine
                {
                    LineNumber = 1,
                    ItemId = TestDb.DefaultItemId,
                    Discount2Percent = 4m,
                    Discount3Percent = 2m,
                },
            ],
        };
        db.ExtraDiscounts.Add(extra);
        await db.SaveChangesAsync();
        var svc = new PricingService(db);

        var result = await svc.ResolveAsync(TestDb.DefaultCustomerId, TestDb.DefaultItemId, 1, DateTime.UtcNow);

        result.Discount2Percent.Should().Be(4m);
        result.Discount3Percent.Should().Be(2m);
    }
}
