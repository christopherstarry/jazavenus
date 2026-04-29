using Jaza.Domain.Audit;
using Jaza.Domain.Common;
using Jaza.Domain.Inbound;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Outbound;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, AppRole, Guid>(options)
{
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<ItemCategory> Categories => Set<ItemCategory>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Location> Locations => Set<Location>();

    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<GoodsReceiptNote> GoodsReceiptNotes => Set<GoodsReceiptNote>();
    public DbSet<GoodsReceiptLine> GoodsReceiptLines => Set<GoodsReceiptLine>();

    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderLine> SalesOrderLines => Set<SalesOrderLine>();
    public DbSet<DeliveryOrder> DeliveryOrders => Set<DeliveryOrder>();
    public DbSet<DeliveryOrderLine> DeliveryOrderLines => Set<DeliveryOrderLine>();

    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<Payment> Payments => Set<Payment>();

    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<StockOnHand> StockOnHand => Set<StockOnHand>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DocumentSeries> DocumentSeries => Set<DocumentSeries>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        ConfigureIdentityTableNames(b);
        ConfigureGlobalConventions(b);
        ConfigureMasterData(b);
        ConfigureInbound(b);
        ConfigureOutbound(b);
        ConfigureInvoicing(b);
        ConfigureStock(b);
        ConfigureAudit(b);
    }

    private static void ConfigureIdentityTableNames(ModelBuilder b)
    {
        b.Entity<AppUser>().ToTable("Users");
        b.Entity<AppRole>().ToTable("Roles");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("UserRoles");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("UserClaims");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("UserLogins");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("UserTokens");
    }

    /// <summary>Apply conventions to every Entity-derived type: PK, audit columns, soft-delete filter, decimal precision.</summary>
    private static void ConfigureGlobalConventions(ModelBuilder b)
    {
        foreach (var et in b.Model.GetEntityTypes())
        {
            var clr = et.ClrType;
            if (typeof(Entity).IsAssignableFrom(clr))
            {
                b.Entity(clr).Property(nameof(Entity.RowVersion)).IsRowVersion();
                b.Entity(clr).Property(nameof(Entity.CreatedAtUtc)).HasDefaultValueSql("SYSUTCDATETIME()");
                b.Entity(clr).HasQueryFilter(GetSoftDeleteFilter(clr));
            }

            foreach (var prop in et.GetProperties())
            {
                if (prop.ClrType == typeof(decimal) || prop.ClrType == typeof(decimal?))
                {
                    prop.SetPrecision(18);
                    prop.SetScale(4);
                }
            }
        }
    }

    private static System.Linq.Expressions.LambdaExpression GetSoftDeleteFilter(Type clrType)
    {
        var p = System.Linq.Expressions.Expression.Parameter(clrType, "e");
        var prop = System.Linq.Expressions.Expression.Property(p, nameof(Entity.IsDeleted));
        var notDeleted = System.Linq.Expressions.Expression.Not(prop);
        return System.Linq.Expressions.Expression.Lambda(notDeleted, p);
    }

    private static void ConfigureMasterData(ModelBuilder b)
    {
        b.Entity<Unit>().HasIndex(x => x.Code).IsUnique().HasFilter("[IsDeleted] = 0");
        b.Entity<ItemCategory>().HasIndex(x => x.Code).IsUnique().HasFilter("[IsDeleted] = 0");
        b.Entity<ItemCategory>().HasOne(c => c.Parent).WithMany().HasForeignKey(c => c.ParentId);

        b.Entity<Item>().HasIndex(x => x.Sku).IsUnique().HasFilter("[IsDeleted] = 0");
        b.Entity<Item>().HasIndex(x => x.Barcode).HasFilter("[IsDeleted] = 0 AND [Barcode] IS NOT NULL");

        b.Entity<Supplier>().HasIndex(x => x.Code).IsUnique().HasFilter("[IsDeleted] = 0");
        b.Entity<Customer>().HasIndex(x => x.Code).IsUnique().HasFilter("[IsDeleted] = 0");
        b.Entity<Warehouse>().HasIndex(x => x.Code).IsUnique().HasFilter("[IsDeleted] = 0");
        b.Entity<Location>().HasIndex(x => new { x.WarehouseId, x.Code }).IsUnique().HasFilter("[IsDeleted] = 0");
    }

    private static void ConfigureInbound(ModelBuilder b)
    {
        b.Entity<PurchaseOrder>().HasIndex(x => x.Number).IsUnique();
        b.Entity<PurchaseOrder>().Ignore(x => x.SubTotal).Ignore(x => x.TaxTotal).Ignore(x => x.GrandTotal);
        b.Entity<PurchaseOrderLine>().Ignore(x => x.LineSubtotal).Ignore(x => x.TaxAmount)
            .Ignore(x => x.LineTotal).Ignore(x => x.QuantityOpen);
        b.Entity<PurchaseOrder>().HasMany(x => x.Lines).WithOne(l => l.PurchaseOrder!)
            .HasForeignKey(l => l.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<GoodsReceiptNote>().HasIndex(x => x.Number).IsUnique();
        b.Entity<GoodsReceiptNote>().HasMany(x => x.Lines).WithOne(l => l.GoodsReceiptNote!)
            .HasForeignKey(l => l.GoodsReceiptNoteId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureOutbound(ModelBuilder b)
    {
        b.Entity<SalesOrder>().HasIndex(x => x.Number).IsUnique();
        b.Entity<SalesOrder>().Ignore(x => x.SubTotal).Ignore(x => x.TaxTotal).Ignore(x => x.GrandTotal);
        b.Entity<SalesOrderLine>().Ignore(x => x.LineSubtotal).Ignore(x => x.TaxAmount)
            .Ignore(x => x.LineTotal).Ignore(x => x.QuantityOpen);
        b.Entity<SalesOrder>().HasMany(x => x.Lines).WithOne(l => l.SalesOrder!)
            .HasForeignKey(l => l.SalesOrderId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<DeliveryOrder>().HasIndex(x => x.Number).IsUnique();
        b.Entity<DeliveryOrder>().HasMany(x => x.Lines).WithOne(l => l.DeliveryOrder!)
            .HasForeignKey(l => l.DeliveryOrderId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureInvoicing(ModelBuilder b)
    {
        b.Entity<Invoice>().HasIndex(x => x.Number).IsUnique();
        b.Entity<Invoice>().Ignore(x => x.SubTotal).Ignore(x => x.TaxTotal).Ignore(x => x.GrandTotal)
            .Ignore(x => x.AmountPaid).Ignore(x => x.AmountDue);
        b.Entity<InvoiceLine>().Ignore(x => x.LineSubtotal).Ignore(x => x.TaxAmount).Ignore(x => x.LineTotal);
        b.Entity<Invoice>().HasMany(x => x.Lines).WithOne(l => l.Invoice!)
            .HasForeignKey(l => l.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Invoice>().HasMany(x => x.Payments).WithOne(p => p.Invoice!)
            .HasForeignKey(p => p.InvoiceId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureStock(ModelBuilder b)
    {
        b.Entity<StockMovement>()
            .HasIndex(x => new { x.ItemId, x.WarehouseId, x.OccurredAtUtc });
        b.Entity<StockMovement>()
            .HasIndex(x => new { x.SourceDocumentType, x.SourceDocumentId });

        b.Entity<StockOnHand>()
            .HasIndex(x => new { x.ItemId, x.WarehouseId, x.LocationId }).IsUnique();
    }

    private static void ConfigureAudit(ModelBuilder b)
    {
        b.Entity<AuditLog>().ToTable("AuditLogs");
        b.Entity<AuditLog>().HasIndex(x => x.OccurredAtUtc);
        b.Entity<AuditLog>().HasIndex(x => new { x.Entity, x.EntityId });
        b.Entity<AuditLog>().Property(x => x.Action).HasMaxLength(64);
        b.Entity<AuditLog>().Property(x => x.Entity).HasMaxLength(64);

        b.Entity<DocumentSeries>(e =>
        {
            e.ToTable("DocumentSeries");
            e.HasKey(x => new { x.Prefix, x.Year });
            e.Property(x => x.Prefix).HasMaxLength(16);
        });
    }
}
