using Jaza.Application.Pricing;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Pricing;

public sealed class PricingService(AppDbContext db) : IPricingService
{
    public async Task<PricingResult> ResolveAsync(Guid customerId, Guid itemId, decimal quantity, DateTime asOf,
        CancellationToken ct = default)
    {
        var item = await db.Items.AsNoTracking().FirstOrDefaultAsync(i => i.Id == itemId, ct)
            ?? throw new KeyNotFoundException("Item not found.");
        var customer = await db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Id == customerId, ct)
            ?? throw new KeyNotFoundException("Customer not found.");

        var unitPrice = await db.ItemPrices.AsNoTracking()
            .Where(p => p.ItemId == itemId && p.IsActive)
            .OrderByDescending(p => p.Price)
            .Select(p => p.Price)
            .FirstOrDefaultAsync(ct);

        if (unitPrice == 0) unitPrice = item.StandardPrice > 0 ? item.StandardPrice : item.StandardCost;

        var d1 = await db.ItemDiscounts.AsNoTracking()
            .Where(d => d.ItemId == itemId && d.IsActive)
            .Select(d => d.DiscountPercent)
            .FirstOrDefaultAsync(ct);

        var d2 = 0m;
        var d3 = 0m;

        if (customer.DiscountCode is not null)
        {
            var extra = await db.ExtraDiscounts.AsNoTracking()
                .Include(e => e.Lines)
                .Where(e => e.Code == customer.DiscountCode && e.IsActive
                         && e.EffectiveFrom <= asOf && (e.EffectiveTo == null || e.EffectiveTo >= asOf))
                .FirstOrDefaultAsync(ct);
            if (extra is not null)
            {
                var line = extra.Lines.FirstOrDefault(l => l.ItemId == itemId || l.CustomerId == customerId);
                if (line is not null)
                {
                    d2 = line.Discount2Percent;
                    d3 = line.Discount3Percent;
                }
            }
        }

        var brandDisc = await db.BrandDiscounts.AsNoTracking()
            .Where(b => b.CustomerId == customerId && b.IsActive)
            .OrderByDescending(b => b.DiscountPercent)
            .FirstOrDefaultAsync(ct);
        if (brandDisc is not null)
        {
            if (brandDisc.DiscountPercent > d2) d2 = brandDisc.DiscountPercent;
            if (brandDisc.DiscountPercent2 > d3) d3 = brandDisc.DiscountPercent2;
        }

        return new PricingResult(unitPrice, d1, d2, d3);
    }
}
