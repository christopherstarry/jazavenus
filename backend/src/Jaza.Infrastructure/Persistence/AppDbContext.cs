using Jaza.Domain.Ar;
using Jaza.Domain.Audit;
using Jaza.Domain.Auth;
using Jaza.Domain.Common;
using Jaza.Domain.Errors;
using Jaza.Domain.Inbound;
using Jaza.Domain.Inventory;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Outbound;
using Jaza.Domain.Pricing;
using Jaza.Domain.Returns;
using Jaza.Domain.Settings;
using Jaza.Domain.Stock;
using Jaza.Domain.Tax;
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
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Bank> Banks => Set<Bank>();
    public DbSet<Salesman> Salesmen => Set<Salesman>();
    public DbSet<Collector> Collectors => Set<Collector>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<WarehouseType> WarehouseTypes => Set<WarehouseType>();
    public DbSet<PaymentTerm> PaymentTerms => Set<PaymentTerm>();
    public DbSet<OutletType> OutletTypes => Set<OutletType>();
    public DbSet<GroupOutlet> GroupOutlets => Set<GroupOutlet>();
    public DbSet<GroupOutletType> GroupOutletTypes => Set<GroupOutletType>();
    public DbSet<TradeType> TradeTypes => Set<TradeType>();
    public DbSet<SubTradeType> SubTradeTypes => Set<SubTradeType>();
    public DbSet<DistributionType> DistributionTypes => Set<DistributionType>();
    public DbSet<PriceTier> PriceTiers => Set<PriceTier>();
    public DbSet<DiscountCode> DiscountCodes => Set<DiscountCode>();
    public DbSet<CostType> CostTypes => Set<CostType>();
    public DbSet<Manufacturing> Manufacturings => Set<Manufacturing>();
    public DbSet<TaxRegistration> TaxRegistrations => Set<TaxRegistration>();
    public DbSet<SubCategory> SubCategories => Set<SubCategory>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<BrandDiscount> BrandDiscounts => Set<BrandDiscount>();
    public DbSet<ClassOutlet> ClassOutlets => Set<ClassOutlet>();
    public DbSet<ItemPrice> ItemPrices => Set<ItemPrice>();
    public DbSet<ItemDiscount> ItemDiscounts => Set<ItemDiscount>();
    public DbSet<BpItem> BpItems => Set<BpItem>();
    public DbSet<Penetration> Penetrations => Set<Penetration>();

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

    // Settings & lookups (Phase 2a)
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<FiscalPeriod> FiscalPeriods => Set<FiscalPeriod>();
    public DbSet<OrderCode> OrderCodes => Set<OrderCode>();
    public DbSet<ReturnCode> ReturnCodes => Set<ReturnCode>();
    public DbSet<ExtraDiscount> ExtraDiscounts => Set<ExtraDiscount>();
    public DbSet<ExtraDiscountLine> ExtraDiscountLines => Set<ExtraDiscountLine>();

    // Returns & AR (Phase 2b)
    public DbSet<SalesReturn> SalesReturns => Set<SalesReturn>();
    public DbSet<SalesReturnLine> SalesReturnLines => Set<SalesReturnLine>();
    public DbSet<PurchaseReturn> PurchaseReturns => Set<PurchaseReturn>();
    public DbSet<PurchaseReturnLine> PurchaseReturnLines => Set<PurchaseReturnLine>();
    public DbSet<CreditMemo> CreditMemos => Set<CreditMemo>();
    public DbSet<CreditMemoLine> CreditMemoLines => Set<CreditMemoLine>();
    public DbSet<PaymentAllocation> PaymentAllocations => Set<PaymentAllocation>();
    public DbSet<PostDatedCheck> PostDatedChecks => Set<PostDatedCheck>();
    public DbSet<PdcClearanceHistory> PdcClearanceHistories => Set<PdcClearanceHistory>();
    public DbSet<ArAdjustment> ArAdjustments => Set<ArAdjustment>();
    public DbSet<ArPeriodClosing> ArPeriodClosings => Set<ArPeriodClosing>();

    // Inventory documents (Phase 2c)
    public DbSet<StockReceipt> StockReceipts => Set<StockReceipt>();
    public DbSet<StockReceiptLine> StockReceiptLines => Set<StockReceiptLine>();
    public DbSet<StockIssue> StockIssues => Set<StockIssue>();
    public DbSet<StockIssueLine> StockIssueLines => Set<StockIssueLine>();
    public DbSet<StockTransfer> StockTransfers => Set<StockTransfer>();
    public DbSet<StockTransferLine> StockTransferLines => Set<StockTransferLine>();
    public DbSet<StockTakeSession> StockTakeSessions => Set<StockTakeSession>();
    public DbSet<StockTakeLine> StockTakeLines => Set<StockTakeLine>();

    // Tax (Phase 2d)
    public DbSet<TaxInvoiceSerial> TaxInvoiceSerials => Set<TaxInvoiceSerial>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();
    public DbSet<DocumentSeries> DocumentSeries => Set<DocumentSeries>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // PostgreSQL convention: snake_case is idiomatic but we keep PascalCase column names so
        // the legacy SQL Server schema (used by the ETL tool) is straightforward to map. PostgreSQL
        // happily quotes mixed-case identifiers; we set the citext extension only for case-insensitive
        // search on a couple of columns (handled per-property with .HasColumnType where needed).
        builder.HasPostgresExtension("citext");

        ConfigureIdentityTableNames(builder);
        ConfigureAuth(builder);
        ConfigureGlobalConventions(builder);
        ConfigureMasterData(builder);
        ConfigureInbound(builder);
        ConfigureOutbound(builder);
        ConfigureInvoicing(builder);
        ConfigureStock(builder);
        ConfigureSettings(builder);
        ConfigureReturns(builder);
        ConfigureAr(builder);
        ConfigureInventoryDocs(builder);
        ConfigureTax(builder);
        ConfigureForeignKeyBehaviors(builder);
        ConfigureAudit(builder);
        ConfigureErrors(builder);
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
        b.Entity<Customer>().HasIndex(x => x.IdNo).HasFilter(NotSoftDeletedFilter + " AND \"IdNo\" IS NOT NULL");
        b.Entity<Warehouse>().HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<Location>().HasIndex(x => new { x.WarehouseId, x.Code }).IsUnique().HasFilter(NotSoftDeletedFilter);

        MapSimple<Brand>(b, "Brands");
        MapSimple<Bank>(b, "Banks");
        MapSimple<Salesman>(b, "Salesmen");
        MapSimple<Collector>(b, "Collectors");
        MapSimple<Area>(b, "Areas");
        MapSimple<WarehouseType>(b, "WarehouseTypes");
        MapSimple<OutletType>(b, "OutletTypes");
        MapSimple<GroupOutlet>(b, "GroupOutlets");
        MapSimple<GroupOutletType>(b, "GroupOutletTypes");
        MapSimple<TradeType>(b, "TradeTypes");
        MapSimple<SubTradeType>(b, "SubTradeTypes");
        MapSimple<DistributionType>(b, "DistributionTypes");
        MapSimple<CostType>(b, "CostTypes");
        MapSimple<Manufacturing>(b, "Manufacturings");
        MapSimple<TaxRegistration>(b, "TaxRegistrations");
        MapSimple<PriceTier>(b, "PriceTiers");
        MapSimple<DiscountCode>(b, "DiscountCodes");

        MapSimple<ClassOutlet>(b, "ClassOutlets");

        b.Entity<PaymentTerm>(e =>
        {
            e.ToTable("PaymentTerms");
            e.HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Code).HasMaxLength(32).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        b.Entity<SubCategory>(e =>
        {
            e.ToTable("SubCategories");
            e.HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Code).HasMaxLength(32).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId);
        });

        b.Entity<CustomerAddress>(e =>
        {
            e.ToTable("CustomerAddresses");
            e.Property(x => x.Label).HasMaxLength(64).IsRequired();
            e.Property(x => x.Address).HasMaxLength(500).IsRequired();
            e.HasOne(x => x.Customer).WithMany(c => c.Addresses).HasForeignKey(x => x.CustomerId);
            e.HasIndex(x => x.CustomerId);
        });

        b.Entity<ItemPrice>(e =>
        {
            e.ToTable("ItemPrices");
            e.HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId);
            e.HasOne(x => x.PriceTier).WithMany().HasForeignKey(x => x.PriceTierId);
            e.HasIndex(x => new { x.ItemId, x.PriceTierId }).IsUnique().HasFilter(NotSoftDeletedFilter);
        });

        b.Entity<ItemDiscount>(e =>
        {
            e.ToTable("ItemDiscounts");
            e.HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId);
            e.HasOne(x => x.DiscountCode).WithMany().HasForeignKey(x => x.DiscountCodeId);
            e.HasIndex(x => new { x.ItemId, x.DiscountCodeId });
        });

        b.Entity<BrandDiscount>(e =>
        {
            e.ToTable("BrandDiscounts");
            e.HasOne(x => x.Customer).WithMany(c => c.BrandDiscounts).HasForeignKey(x => x.CustomerId);
            e.HasIndex(x => x.CustomerId);
            e.Property(x => x.BrandCode).HasMaxLength(32).IsRequired();
            e.Property(x => x.PriceCode).HasMaxLength(32);
        });

        b.Entity<BpItem>(e =>
        {
            e.ToTable("BpItems");
            e.Property(x => x.SupplierItemCode).HasMaxLength(64).IsRequired();
            e.Property(x => x.Uom).HasMaxLength(16);
            e.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId);
            e.HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId);
            e.HasIndex(x => new { x.SupplierId, x.SupplierItemCode }).IsUnique().HasFilter(NotSoftDeletedFilter);
        });

        b.Entity<Penetration>(e =>
        {
            e.ToTable("Penetrations");
            e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId);
            e.HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId);
            e.HasOne(x => x.Brand).WithMany().HasForeignKey(x => x.BrandId);
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId);
            e.HasIndex(x => new { x.CustomerId, x.PeriodYear, x.PeriodMonth });
        });
    }

    private static void MapSimple<T>(ModelBuilder b, string table) where T : class
    {
        b.Entity<T>(e =>
        {
            e.ToTable(table);
            var et = e.Metadata.ClrType;
            var codeProp = et.GetProperty("Code");
            var nameProp = et.GetProperty("Name");
            if (codeProp != null)
            {
                e.HasIndex("Code").IsUnique().HasFilter(NotSoftDeletedFilter);
                e.Property("Code").HasMaxLength(32).IsRequired();
            }
            if (nameProp != null)
                e.Property("Name").HasMaxLength(200).IsRequired();
        });
    }

    private static void ConfigureInbound(ModelBuilder b)
    {
        b.Entity<PurchaseOrder>().HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<PurchaseOrder>().Property(x => x.Division).HasMaxLength(50);
        b.Entity<PurchaseOrder>().Ignore(x => x.SubTotal).Ignore(x => x.TaxTotal).Ignore(x => x.GrandTotal);
        b.Entity<PurchaseOrderLine>().Ignore(x => x.LineSubtotal).Ignore(x => x.TaxAmount)
            .Ignore(x => x.LineTotal).Ignore(x => x.QuantityOpen);
        b.Entity<PurchaseOrder>().HasMany(x => x.Lines).WithOne(l => l.PurchaseOrder!)
            .HasForeignKey(l => l.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<GoodsReceiptNote>().HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<GoodsReceiptNote>().Property(x => x.Division).HasMaxLength(50);
        b.Entity<GoodsReceiptNote>().HasMany(x => x.Lines).WithOne(l => l.GoodsReceiptNote!)
            .HasForeignKey(l => l.GoodsReceiptNoteId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureOutbound(ModelBuilder b)
    {
        b.Entity<SalesOrder>().HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<SalesOrder>().Property(x => x.Division).HasMaxLength(50);
        b.Entity<SalesOrder>().Ignore(x => x.SubTotal).Ignore(x => x.TaxTotal).Ignore(x => x.GrandTotal);
        b.Entity<SalesOrderLine>().Ignore(x => x.LineSubtotal).Ignore(x => x.TaxAmount)
            .Ignore(x => x.LineTotal).Ignore(x => x.QuantityOpen);
        b.Entity<SalesOrder>().HasMany(x => x.Lines).WithOne(l => l.SalesOrder!)
            .HasForeignKey(l => l.SalesOrderId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<DeliveryOrder>().HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<DeliveryOrder>().Property(x => x.Division).HasMaxLength(50);
        b.Entity<DeliveryOrder>().HasMany(x => x.Lines).WithOne(l => l.DeliveryOrder!)
            .HasForeignKey(l => l.DeliveryOrderId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureInvoicing(ModelBuilder b)
    {
        b.Entity<Invoice>().HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
        b.Entity<Invoice>().Property(x => x.Division).HasMaxLength(50);
        b.Entity<Invoice>().Property(x => x.TaxSerial).HasMaxLength(64);
        b.Entity<Invoice>().Ignore(x => x.SubTotal).Ignore(x => x.TaxTotal).Ignore(x => x.GrandTotal)
            .Ignore(x => x.AmountPaid).Ignore(x => x.AmountDue);
        b.Entity<InvoiceLine>().Ignore(x => x.LineSubtotal).Ignore(x => x.TaxAmount).Ignore(x => x.LineTotal);
        b.Entity<Invoice>().HasMany(x => x.Lines).WithOne(l => l.Invoice!)
            .HasForeignKey(l => l.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Invoice>().HasMany(x => x.Payments).WithOne(p => p.Invoice!)
            .HasForeignKey(p => p.InvoiceId).OnDelete(DeleteBehavior.SetNull);
        b.Entity<Invoice>().HasMany(x => x.PaymentAllocations).WithOne(a => a.Invoice!)
            .HasForeignKey(a => a.InvoiceId).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Payment>().Property(x => x.Division).HasMaxLength(50);
        b.Entity<Payment>().HasIndex(x => x.CustomerId);
        b.Entity<Payment>().HasIndex(x => x.InvoiceId);
        b.Entity<Payment>().HasMany(x => x.Allocations).WithOne(a => a.Payment!)
            .HasForeignKey(a => a.PaymentId).OnDelete(DeleteBehavior.Cascade);
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

    private static void ConfigureSettings(ModelBuilder b)
    {
        b.Entity<CompanySettings>(e =>
        {
            e.ToTable("company_settings");
            e.HasIndex(x => x.Division).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.Property(x => x.CompanyName).HasMaxLength(200).IsRequired();
        });

        b.Entity<FiscalPeriod>(e =>
        {
            e.ToTable("fiscal_periods");
            e.HasIndex(x => new { x.Division, x.Year, x.Month }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
        });

        b.Entity<OrderCode>(e =>
        {
            e.ToTable("order_codes");
            e.HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Code).HasMaxLength(32).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        b.Entity<ReturnCode>(e =>
        {
            e.ToTable("return_codes");
            e.HasIndex(x => x.Code).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Code).HasMaxLength(32).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        b.Entity<ExtraDiscount>(e =>
        {
            e.ToTable("extra_discounts");
            e.HasIndex(x => new { x.Division, x.Code }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Code).HasMaxLength(32).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasMany(x => x.Lines).WithOne(l => l.ExtraDiscount!)
                .HasForeignKey(l => l.ExtraDiscountId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ExtraDiscountLine>().ToTable("extra_discount_lines");
    }

    private static void ConfigureReturns(ModelBuilder b)
    {
        b.Entity<SalesReturn>(e =>
        {
            e.ToTable("sales_returns");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasIndex(x => x.InvoiceId);
            e.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.SetNull);
            e.HasMany(x => x.Lines).WithOne(l => l.SalesReturn!)
                .HasForeignKey(l => l.SalesReturnId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<SalesReturnLine>().ToTable("sales_return_lines");

        b.Entity<PurchaseReturn>(e =>
        {
            e.ToTable("purchase_returns");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasIndex(x => x.GoodsReceiptNoteId);
            e.HasOne(x => x.GoodsReceiptNote).WithMany().HasForeignKey(x => x.GoodsReceiptNoteId).OnDelete(DeleteBehavior.SetNull);
            e.HasMany(x => x.Lines).WithOne(l => l.PurchaseReturn!)
                .HasForeignKey(l => l.PurchaseReturnId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<PurchaseReturnLine>().ToTable("purchase_return_lines");

        b.Entity<CreditMemo>(e =>
        {
            e.ToTable("credit_memos");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.Property(x => x.TaxSerial).HasMaxLength(64);
            e.HasIndex(x => x.SalesReturnId);
            e.HasIndex(x => x.InvoiceId);
            e.HasOne(x => x.SalesReturn).WithMany().HasForeignKey(x => x.SalesReturnId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.SetNull);
            e.HasMany(x => x.Lines).WithOne(l => l.CreditMemo!)
                .HasForeignKey(l => l.CreditMemoId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<CreditMemoLine>().ToTable("credit_memo_lines");
    }

    private static void ConfigureAr(ModelBuilder b)
    {
        b.Entity<PaymentAllocation>(e =>
        {
            e.ToTable("payment_allocations");
            e.HasIndex(x => x.PaymentId);
            e.HasIndex(x => x.InvoiceId);
            e.HasOne(x => x.Payment).WithMany(p => p.Allocations).HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Invoice).WithMany(i => i.PaymentAllocations).HasForeignKey(x => x.InvoiceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<PostDatedCheck>(e =>
        {
            e.ToTable("post_dated_checks");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasMany(x => x.History).WithOne(h => h.PostDatedCheck!)
                .HasForeignKey(h => h.PostDatedCheckId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<PdcClearanceHistory>().ToTable("pdc_clearance_history");

        b.Entity<ArAdjustment>(e =>
        {
            e.ToTable("ar_adjustments");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
        });

        b.Entity<ArPeriodClosing>(e =>
        {
            e.ToTable("ar_period_closings");
            e.HasIndex(x => new { x.Division, x.Year, x.Month }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
        });
    }

    private static void ConfigureInventoryDocs(ModelBuilder b)
    {
        b.Entity<StockReceipt>(e =>
        {
            e.ToTable("stock_receipts");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasMany(x => x.Lines).WithOne(l => l.StockReceipt!)
                .HasForeignKey(l => l.StockReceiptId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<StockReceiptLine>().ToTable("stock_receipt_lines");

        b.Entity<StockIssue>(e =>
        {
            e.ToTable("stock_issues");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasMany(x => x.Lines).WithOne(l => l.StockIssue!)
                .HasForeignKey(l => l.StockIssueId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<StockIssueLine>().ToTable("stock_issue_lines");

        b.Entity<StockTransfer>(e =>
        {
            e.ToTable("stock_transfers");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasMany(x => x.Lines).WithOne(l => l.StockTransfer!)
                .HasForeignKey(l => l.StockTransferId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<StockTransferLine>().ToTable("stock_transfer_lines");

        b.Entity<StockTakeSession>(e =>
        {
            e.ToTable("stock_take_sessions");
            e.HasIndex(x => new { x.Division, x.Number }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.HasMany(x => x.Lines).WithOne(l => l.StockTakeSession!)
                .HasForeignKey(l => l.StockTakeSessionId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<StockTakeLine>(e =>
        {
            e.ToTable("stock_take_lines");
            e.Ignore(x => x.Variance);
        });
    }

    private static void ConfigureTax(ModelBuilder b)
    {
        b.Entity<TaxInvoiceSerial>(e =>
        {
            e.ToTable("tax_invoice_serials");
            e.HasIndex(x => new { x.Division, x.SerialNumber }).IsUnique().HasFilter(NotSoftDeletedFilter);
            e.Property(x => x.Division).HasMaxLength(50);
            e.Property(x => x.SerialNumber).HasMaxLength(64).IsRequired();
            e.HasOne(x => x.TaxRegistration).WithMany().HasForeignKey(x => x.TaxRegistrationId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => x.CreditMemoId);
            e.HasOne(x => x.CreditMemo).WithMany().HasForeignKey(x => x.CreditMemoId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureForeignKeyBehaviors(ModelBuilder b)
    {
        // Master → transaction headers: restrict (do not delete posted docs when master is removed)
        b.Entity<PurchaseOrder>().HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<PurchaseOrder>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<GoodsReceiptNote>().HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<GoodsReceiptNote>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<GoodsReceiptNote>().HasOne(x => x.PurchaseOrder).WithMany().HasForeignKey(x => x.PurchaseOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<SalesOrder>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<SalesOrder>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<DeliveryOrder>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<DeliveryOrder>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<DeliveryOrder>().HasOne(x => x.SalesOrder).WithMany().HasForeignKey(x => x.SalesOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Invoice>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<Invoice>().HasOne(x => x.DeliveryOrder).WithMany().HasForeignKey(x => x.DeliveryOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Payment>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<SalesReturn>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<SalesReturn>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<SalesReturn>().HasOne(x => x.DeliveryOrder).WithMany().HasForeignKey(x => x.DeliveryOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<PurchaseReturn>().HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<PurchaseReturn>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<CreditMemo>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<PostDatedCheck>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<PostDatedCheck>().HasOne(x => x.Bank).WithMany().HasForeignKey(x => x.BankId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<ArAdjustment>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Lines → Item: restrict (preserve history when product is removed)
        foreach (var lineType in new[]
        {
            typeof(PurchaseOrderLine), typeof(GoodsReceiptLine), typeof(SalesOrderLine),
            typeof(DeliveryOrderLine), typeof(InvoiceLine), typeof(SalesReturnLine),
            typeof(PurchaseReturnLine), typeof(CreditMemoLine), typeof(StockReceiptLine),
            typeof(StockIssueLine), typeof(StockTransferLine), typeof(StockTakeLine),
        })
        {
            var entity = b.Entity(lineType);
            var itemProp = lineType.GetProperty("ItemId");
            if (itemProp is not null)
                entity.HasOne("Item").WithMany().HasForeignKey("ItemId").OnDelete(DeleteBehavior.Restrict);
        }

        b.Entity<StockTransfer>().HasOne(x => x.FromWarehouse).WithMany().HasForeignKey(x => x.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<StockTransfer>().HasOne(x => x.ToWarehouse).WithMany().HasForeignKey(x => x.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<StockReceipt>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<StockIssue>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<StockTakeSession>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<StockMovement>().HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<StockMovement>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<StockOnHand>().HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<StockOnHand>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<ExtraDiscountLine>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);
        b.Entity<ExtraDiscountLine>().HasOne(x => x.Brand).WithMany().HasForeignKey(x => x.BrandId)
            .OnDelete(DeleteBehavior.SetNull);
        b.Entity<ExtraDiscountLine>().HasOne(x => x.Item).WithMany().HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureAudit(ModelBuilder b)
    {
        b.Entity<AuditLog>().ToTable("AuditLogs");
        b.Entity<AuditLog>().HasIndex(x => x.OccurredAtUtc);
        b.Entity<AuditLog>().HasIndex(x => new { x.Entity, x.EntityId });
        b.Entity<AuditLog>().HasIndex(x => x.EntityCode);
        b.Entity<AuditLog>().HasIndex(x => new { x.Module, x.OccurredAtUtc });
        b.Entity<AuditLog>().HasIndex(x => new { x.UserId, x.OccurredAtUtc });
        b.Entity<AuditLog>().Property(x => x.Action).HasMaxLength(64);
        b.Entity<AuditLog>().Property(x => x.Entity).HasMaxLength(64);
        b.Entity<AuditLog>().Property(x => x.EntityCode).HasMaxLength(64);
        b.Entity<AuditLog>().Property(x => x.Module).HasMaxLength(32);

        b.Entity<DocumentSeries>(e =>
        {
            e.ToTable("DocumentSeries");
            e.HasKey(x => new { x.Prefix, x.Year });
            e.Property(x => x.Prefix).HasMaxLength(16);
        });
    }

    private static void ConfigureErrors(ModelBuilder b)
    {
        b.Entity<ErrorLog>(e =>
        {
            e.ToTable("ErrorLogs");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.OccurredAtUtc);
            e.HasIndex(x => x.ExceptionType);
            e.Property(x => x.Message).HasMaxLength(4000).IsRequired();
            e.Property(x => x.ExceptionType).HasMaxLength(256);
            e.Property(x => x.RequestPath).HasMaxLength(512);
            e.Property(x => x.RequestMethod).HasMaxLength(10);
            e.Property(x => x.UserId).HasMaxLength(64);
            e.Property(x => x.UserName).HasMaxLength(128);
            e.Property(x => x.IpAddress).HasMaxLength(64);
            e.Property(x => x.UserAgent).HasMaxLength(512);
        });
    }
}
