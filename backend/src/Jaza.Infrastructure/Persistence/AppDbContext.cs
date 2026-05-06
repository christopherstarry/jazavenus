using Jaza.Domain.Audit;
using Jaza.Domain.Auth;
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
    // Auth + permissions
    public DbSet<UserModulePermission> UserModulePermissions => Set<UserModulePermission>();
    public DbSet<UserReportPermission> UserReportPermissions => Set<UserReportPermission>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Master data
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<ItemCategory> Categories => Set<ItemCategory>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Location> Locations => Set<Location>();

    // Purchase
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<GoodsReceiptNote> GoodsReceiptNotes => Set<GoodsReceiptNote>();
    public DbSet<GoodsReceiptLine> GoodsReceiptLines => Set<GoodsReceiptLine>();

    // Sales
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderLine> SalesOrderLines => Set<SalesOrderLine>();
    public DbSet<DeliveryOrder> DeliveryOrders => Set<DeliveryOrder>();
    public DbSet<DeliveryOrderLine> DeliveryOrderLines => Set<DeliveryOrderLine>();

    // Invoicing
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<Payment> Payments => Set<Payment>();

    // Stock
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<StockOnHand> StockOnHand => Set<StockOnHand>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DocumentSeries> DocumentSeries => Set<DocumentSeries>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // PostgreSQL convention: snake_case is idiomatic but we keep PascalCase column names so
        // the legacy SQL Server schema (used by the ETL tool) is straightforward to map. PostgreSQL
        // happily quotes mixed-case identifiers; we set the citext extension only for case-insensitive
        // search on a couple of columns (handled per-property with .HasColumnType where needed).
        b.HasPostgresExtension("citext");

        ConfigureIdentityTableNames(b);
        ConfigureAuth(b);
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
        b.Entity<AppUser>(e =>
        {
            e.ToTable("AppUsers");
            e.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.RoleId);
            e.HasIndex(x => x.IsActive);
        });
        b.Entity<AppRole>().ToTable("AppRoles");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("AppUserRoles");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("AppUserClaims");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("AppUserLogins");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("AppRoleClaims");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("AppUserTokens");
    }

    private static void ConfigureAuth(ModelBuilder b)
    {
        b.Entity<UserModulePermission>(e =>
        {
            e.ToTable("UserModulePermissions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Module).HasMaxLength(20).IsRequired();
            e.HasIndex(x => new { x.UserId, x.Module }).IsUnique();
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<UserReportPermission>(e =>
        {
            e.ToTable("UserReportPermissions");
            e.HasKey(x => x.Id);
            e.Property(x => x.ReportType).HasMaxLength(20).IsRequired();
            e.HasIndex(x => new { x.UserId, x.ReportType }).IsUnique();
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<UserPreference>(e =>
        {
            e.ToTable("UserPreferences");
            e.HasKey(x => x.UserId);
            e.Property(x => x.Language).HasMaxLength(5).IsRequired();
            e.Property(x => x.TextSize).HasMaxLength(10).IsRequired();
            e.Property(x => x.Theme).HasMaxLength(10).IsRequired();
            e.HasOne<AppUser>().WithOne().HasForeignKey<UserPreference>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<RefreshToken>(e =>
        {
            e.ToTable("RefreshTokens");
            e.HasKey(x => x.Id);
            e.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            e.Property(x => x.RevocationReason).HasMaxLength(64);
            e.HasIndex(x => x.TokenHash).IsUnique();
            e.HasIndex(x => x.UserId);
            // Active-token lookup: by user + still valid + not revoked.
            e.HasIndex(x => new { x.UserId, x.ExpiresAtUtc })
                .HasFilter("\"RevokedAtUtc\" IS NULL");
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    /// <summary>Apply conventions to every Entity-derived type: PK, audit columns, soft-delete filter, decimal precision.</summary>
    private static void ConfigureGlobalConventions(ModelBuilder b)
    {
        foreach (var et in b.Model.GetEntityTypes())
        {
            var clr = et.ClrType;
            if (typeof(Entity).IsAssignableFrom(clr))
            {
                // PostgreSQL exposes "xmin" as a system column on every table — it's the transaction
                // id of the last writer. Mapping our RowVersion property to xmin gives us optimistic
                // concurrency for free, no schema changes, and Npgsql populates it on every load.
                b.Entity(clr).Property(nameof(Entity.RowVersion))
                    .HasColumnName("xmin")
                    .HasColumnType("xid")
                    .ValueGeneratedOnAddOrUpdate()
                    .IsConcurrencyToken();
                b.Entity(clr).Property(nameof(Entity.CreatedAtUtc))
                    .HasDefaultValueSql("now() at time zone 'utc'");
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

    private const string NotSoftDeletedFilter = "\"IsDeleted\" = false";

    private static void ConfigureMasterData(ModelBuilder b)
    {
        b.Entity<Unit>().HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<ItemCategory>().HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<ItemCategory>().HasOne(c => c.Parent).WithMany().HasForeignKey(c => c.ParentId);

        b.Entity<Item>().HasIndex(x => x.Sku).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<Item>().HasIndex(x => x.Barcode)
            .HasFilter("\"IsDeleted\" = false AND \"Barcode\" IS NOT NULL");

        b.Entity<Supplier>().HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<Customer>().HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<Warehouse>().HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<Location>().HasIndex(x => new { x.WarehouseId, x.Code }).IsUnique().HasFilter(NotSoftDeletedFilter);
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
