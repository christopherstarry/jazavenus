using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Migration;

/// <summary>Pre-populates <see cref="LegacyIdMap"/> from rows already in PostgreSQL (reruns / incremental).</summary>
public static class LegacyIdMapHydrator
{
    public static async Task HydrateAsync(AppDbContext db, LegacyIdMap map, CancellationToken ct = default)
    {
        foreach (var u in await db.Units.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Unit", u.Code, u.Id);
        foreach (var c in await db.Categories.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Category", c.Code, c.Id);
        foreach (var b in await db.Brands.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Brand", b.Code, b.Id);
        foreach (var s in await db.Suppliers.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Supplier", s.Code, s.Id);
        foreach (var c in await db.Customers.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Customer", c.Code, c.Id);
        foreach (var w in await db.Warehouses.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Warehouse", w.Code, w.Id);
        foreach (var i in await db.Items.AsNoTracking().ToListAsync(ct))
            map.RegisterMaster("Item", i.Sku, i.Id);

        foreach (var po in await db.PurchaseOrders.AsNoTracking().Where(x => x.LegacyId != null).ToListAsync(ct))
            map.RegisterDocument(po.Division, "PurchaseOrder", po.LegacyId!.Value, po.Id);
        foreach (var so in await db.SalesOrders.AsNoTracking().Where(x => x.LegacyId != null).ToListAsync(ct))
            map.RegisterDocument(so.Division, "SalesOrder", so.LegacyId!.Value, so.Id);
        foreach (var inv in await db.Invoices.AsNoTracking().Where(x => x.LegacyId != null).ToListAsync(ct))
            map.RegisterDocument(inv.Division, "Invoice", inv.LegacyId!.Value, inv.Id);
        foreach (var pay in await db.Payments.AsNoTracking().Where(x => x.LegacyId != null).ToListAsync(ct))
            map.RegisterDocument(pay.Division, "Payment", pay.LegacyId!.Value, pay.Id);
    }
}
