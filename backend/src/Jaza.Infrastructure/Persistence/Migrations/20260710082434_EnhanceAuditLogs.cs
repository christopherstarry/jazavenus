using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jaza.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_Number",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_Number",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_Number",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_GoodsReceiptNotes_Number",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryOrders_Number",
                table: "DeliveryOrders");

            migrationBuilder.AddColumn<decimal>(
                name: "CommittedQuantity",
                table: "StockOnHand",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "SalesOrders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "BaseDocumentId",
                table: "SalesOrderLines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BaseDocumentType",
                table: "SalesOrderLines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BaseLineNumber",
                table: "SalesOrderLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseQuantity",
                table: "SalesOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount2Percent",
                table: "SalesOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount3Percent",
                table: "SalesOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityCommitted",
                table: "SalesOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "PurchaseOrders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "BaseDocumentId",
                table: "PurchaseOrderLines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BaseDocumentType",
                table: "PurchaseOrderLines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BaseLineNumber",
                table: "PurchaseOrderLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseQuantity",
                table: "PurchaseOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount2Percent",
                table: "PurchaseOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount3Percent",
                table: "PurchaseOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "PostedAtUtc",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PostedByUserId",
                table: "Invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxSerial",
                table: "Invoices",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BaseDocumentId",
                table: "InvoiceLines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BaseDocumentType",
                table: "InvoiceLines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BaseLineNumber",
                table: "InvoiceLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseQuantity",
                table: "InvoiceLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount2Percent",
                table: "InvoiceLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount3Percent",
                table: "InvoiceLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "GoodsReceiptNotes",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "BaseDocumentId",
                table: "GoodsReceiptLines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BaseDocumentType",
                table: "GoodsReceiptLines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BaseLineNumber",
                table: "GoodsReceiptLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseQuantity",
                table: "GoodsReceiptLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount2Percent",
                table: "GoodsReceiptLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount3Percent",
                table: "GoodsReceiptLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "DeliveryOrders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "BaseDocumentId",
                table: "DeliveryOrderLines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BaseDocumentType",
                table: "DeliveryOrderLines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BaseLineNumber",
                table: "DeliveryOrderLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseQuantity",
                table: "DeliveryOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount2Percent",
                table: "DeliveryOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount3Percent",
                table: "DeliveryOrderLines",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ChangesJson",
                table: "AuditLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AuditLogs",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Module",
                table: "AuditLogs",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ar_adjustments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdjustmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ReasonCode = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ar_adjustments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ar_adjustments_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ar_period_closings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    ClosedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ar_period_closings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "company_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Fax = table.Column<string>(type: "text", nullable: true),
                    NpwpNumber = table.Column<string>(type: "text", nullable: true),
                    PkpNumber = table.Column<string>(type: "text", nullable: true),
                    DefaultCurrency = table.Column<string>(type: "text", nullable: true),
                    SettingsJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_settings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "credit_memos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesReturnId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    TaxSerial = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_credit_memos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_credit_memos_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "extra_discounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_extra_discounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "fiscal_periods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    ClosedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fiscal_periods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "order_codes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_codes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "payment_allocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    AllocatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_allocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payment_allocations_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_payment_allocations_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_dated_checks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    BankId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ChequeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Reference = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_dated_checks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_post_dated_checks_Banks_BankId",
                        column: x => x.BankId,
                        principalTable: "Banks",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_post_dated_checks_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_returns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    GoodsReceiptNoteId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReturnCode = table.Column<string>(type: "text", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_returns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_returns_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchase_returns_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "return_codes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_return_codes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "sales_returns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReturnCode = table.Column<string>(type: "text", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_returns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_returns_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sales_returns_DeliveryOrders_DeliveryOrderId",
                        column: x => x.DeliveryOrderId,
                        principalTable: "DeliveryOrders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_sales_returns_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_issues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReasonCode = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_issues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_issues_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_receipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReasonCode = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_receipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_receipts_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_take_sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_take_sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_take_sessions_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_transfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FromWarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToWarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_transfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_transfers_Warehouses_FromWarehouseId",
                        column: x => x.FromWarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_transfers_Warehouses_ToWarehouseId",
                        column: x => x.ToWarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tax_invoice_serials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Division = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TaxRegistrationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreditMemoId = table.Column<Guid>(type: "uuid", nullable: true),
                    AllocatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AllocatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UsedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tax_invoice_serials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tax_invoice_serials_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_tax_invoice_serials_TaxRegistrations_TaxRegistrationId",
                        column: x => x.TaxRegistrationId,
                        principalTable: "TaxRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "credit_memo_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreditMemoId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    BaseDocumentType = table.Column<string>(type: "text", nullable: true),
                    BaseDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    BaseLineNumber = table.Column<int>(type: "integer", nullable: true),
                    BaseQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TaxPercent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_credit_memo_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_credit_memo_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_credit_memo_lines_credit_memos_CreditMemoId",
                        column: x => x.CreditMemoId,
                        principalTable: "credit_memos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "extra_discount_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExtraDiscountId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: true),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: true),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    Discount2Percent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Discount3Percent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_extra_discount_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_extra_discount_lines_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_extra_discount_lines_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_extra_discount_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_extra_discount_lines_extra_discounts_ExtraDiscountId",
                        column: x => x.ExtraDiscountId,
                        principalTable: "extra_discounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pdc_clearance_history",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PostDatedCheckId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    OccurredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pdc_clearance_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pdc_clearance_history_post_dated_checks_PostDatedCheckId",
                        column: x => x.PostDatedCheckId,
                        principalTable: "post_dated_checks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_return_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseReturnId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    BaseDocumentType = table.Column<string>(type: "text", nullable: true),
                    BaseDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    BaseLineNumber = table.Column<int>(type: "integer", nullable: true),
                    BaseQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_return_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_return_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchase_return_lines_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_purchase_return_lines_purchase_returns_PurchaseReturnId",
                        column: x => x.PurchaseReturnId,
                        principalTable: "purchase_returns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sales_return_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesReturnId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    BaseDocumentType = table.Column<string>(type: "text", nullable: true),
                    BaseDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    BaseLineNumber = table.Column<int>(type: "integer", nullable: true),
                    BaseQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Discount2Percent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Discount3Percent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TaxPercent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_return_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_return_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sales_return_lines_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_sales_return_lines_sales_returns_SalesReturnId",
                        column: x => x.SalesReturnId,
                        principalTable: "sales_returns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_issue_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockIssueId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_issue_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_issue_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_issue_lines_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_issue_lines_stock_issues_StockIssueId",
                        column: x => x.StockIssueId,
                        principalTable: "stock_issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_receipt_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockReceiptId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    BatchOrSerial = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_receipt_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_receipt_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_receipt_lines_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_receipt_lines_stock_receipts_StockReceiptId",
                        column: x => x.StockReceiptId,
                        principalTable: "stock_receipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_take_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockTakeSessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    SystemQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CountedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_take_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_take_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_take_lines_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_take_lines_stock_take_sessions_StockTakeSessionId",
                        column: x => x.StockTakeSessionId,
                        principalTable: "stock_take_sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_transfer_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockTransferId = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromLocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    ToLocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    LegacyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_transfer_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_transfer_lines_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_transfer_lines_Locations_FromLocationId",
                        column: x => x.FromLocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_transfer_lines_Locations_ToLocationId",
                        column: x => x.ToLocationId,
                        principalTable: "Locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_transfer_lines_stock_transfers_StockTransferId",
                        column: x => x.StockTransferId,
                        principalTable: "stock_transfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_Division_Number",
                table: "SalesOrders",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Division_Number",
                table: "PurchaseOrders",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Division_Number",
                table: "Invoices",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptNotes_Division_Number",
                table: "GoodsReceiptNotes",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryOrders_Division_Number",
                table: "DeliveryOrders",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityCode",
                table: "AuditLogs",
                column: "EntityCode");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Module_OccurredAtUtc",
                table: "AuditLogs",
                columns: new[] { "Module", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId_OccurredAtUtc",
                table: "AuditLogs",
                columns: new[] { "UserId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ar_adjustments_CustomerId",
                table: "ar_adjustments",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ar_adjustments_Division_Number",
                table: "ar_adjustments",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ar_period_closings_Division_Year_Month",
                table: "ar_period_closings",
                columns: new[] { "Division", "Year", "Month" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_company_settings_Division",
                table: "company_settings",
                column: "Division",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memo_lines_CreditMemoId",
                table: "credit_memo_lines",
                column: "CreditMemoId");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memo_lines_ItemId",
                table: "credit_memo_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memos_CustomerId",
                table: "credit_memos",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memos_Division_Number",
                table: "credit_memos",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_extra_discount_lines_BrandId",
                table: "extra_discount_lines",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_extra_discount_lines_CustomerId",
                table: "extra_discount_lines",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_extra_discount_lines_ExtraDiscountId",
                table: "extra_discount_lines",
                column: "ExtraDiscountId");

            migrationBuilder.CreateIndex(
                name: "IX_extra_discount_lines_ItemId",
                table: "extra_discount_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_extra_discounts_Division_Code",
                table: "extra_discounts",
                columns: new[] { "Division", "Code" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_fiscal_periods_Division_Year_Month",
                table: "fiscal_periods",
                columns: new[] { "Division", "Year", "Month" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_order_codes_Code",
                table: "order_codes",
                column: "Code",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_payment_allocations_InvoiceId",
                table: "payment_allocations",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_payment_allocations_PaymentId",
                table: "payment_allocations",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_pdc_clearance_history_PostDatedCheckId",
                table: "pdc_clearance_history",
                column: "PostDatedCheckId");

            migrationBuilder.CreateIndex(
                name: "IX_post_dated_checks_BankId",
                table: "post_dated_checks",
                column: "BankId");

            migrationBuilder.CreateIndex(
                name: "IX_post_dated_checks_CustomerId",
                table: "post_dated_checks",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_post_dated_checks_Division_Number",
                table: "post_dated_checks",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_return_lines_ItemId",
                table: "purchase_return_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_return_lines_LocationId",
                table: "purchase_return_lines",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_return_lines_PurchaseReturnId",
                table: "purchase_return_lines",
                column: "PurchaseReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_returns_Division_Number",
                table: "purchase_returns",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_returns_SupplierId",
                table: "purchase_returns",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_returns_WarehouseId",
                table: "purchase_returns",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_return_codes_Code",
                table: "return_codes",
                column: "Code",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_sales_return_lines_ItemId",
                table: "sales_return_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_return_lines_LocationId",
                table: "sales_return_lines",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_return_lines_SalesReturnId",
                table: "sales_return_lines",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_CustomerId",
                table: "sales_returns",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_DeliveryOrderId",
                table: "sales_returns",
                column: "DeliveryOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_Division_Number",
                table: "sales_returns",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_WarehouseId",
                table: "sales_returns",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_issue_lines_ItemId",
                table: "stock_issue_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_issue_lines_LocationId",
                table: "stock_issue_lines",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_issue_lines_StockIssueId",
                table: "stock_issue_lines",
                column: "StockIssueId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_issues_Division_Number",
                table: "stock_issues",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_issues_WarehouseId",
                table: "stock_issues",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipt_lines_ItemId",
                table: "stock_receipt_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipt_lines_LocationId",
                table: "stock_receipt_lines",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipt_lines_StockReceiptId",
                table: "stock_receipt_lines",
                column: "StockReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipts_Division_Number",
                table: "stock_receipts",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipts_WarehouseId",
                table: "stock_receipts",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_lines_ItemId",
                table: "stock_take_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_lines_LocationId",
                table: "stock_take_lines",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_lines_StockTakeSessionId",
                table: "stock_take_lines",
                column: "StockTakeSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_sessions_Division_Number",
                table: "stock_take_sessions",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_sessions_WarehouseId",
                table: "stock_take_sessions",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfer_lines_FromLocationId",
                table: "stock_transfer_lines",
                column: "FromLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfer_lines_ItemId",
                table: "stock_transfer_lines",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfer_lines_StockTransferId",
                table: "stock_transfer_lines",
                column: "StockTransferId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfer_lines_ToLocationId",
                table: "stock_transfer_lines",
                column: "ToLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfers_Division_Number",
                table: "stock_transfers",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfers_FromWarehouseId",
                table: "stock_transfers",
                column: "FromWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfers_ToWarehouseId",
                table: "stock_transfers",
                column: "ToWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_tax_invoice_serials_Division_SerialNumber",
                table: "tax_invoice_serials",
                columns: new[] { "Division", "SerialNumber" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_tax_invoice_serials_InvoiceId",
                table: "tax_invoice_serials",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_tax_invoice_serials_TaxRegistrationId",
                table: "tax_invoice_serials",
                column: "TaxRegistrationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ar_adjustments");

            migrationBuilder.DropTable(
                name: "ar_period_closings");

            migrationBuilder.DropTable(
                name: "company_settings");

            migrationBuilder.DropTable(
                name: "credit_memo_lines");

            migrationBuilder.DropTable(
                name: "extra_discount_lines");

            migrationBuilder.DropTable(
                name: "fiscal_periods");

            migrationBuilder.DropTable(
                name: "order_codes");

            migrationBuilder.DropTable(
                name: "payment_allocations");

            migrationBuilder.DropTable(
                name: "pdc_clearance_history");

            migrationBuilder.DropTable(
                name: "purchase_return_lines");

            migrationBuilder.DropTable(
                name: "return_codes");

            migrationBuilder.DropTable(
                name: "sales_return_lines");

            migrationBuilder.DropTable(
                name: "stock_issue_lines");

            migrationBuilder.DropTable(
                name: "stock_receipt_lines");

            migrationBuilder.DropTable(
                name: "stock_take_lines");

            migrationBuilder.DropTable(
                name: "stock_transfer_lines");

            migrationBuilder.DropTable(
                name: "tax_invoice_serials");

            migrationBuilder.DropTable(
                name: "credit_memos");

            migrationBuilder.DropTable(
                name: "extra_discounts");

            migrationBuilder.DropTable(
                name: "post_dated_checks");

            migrationBuilder.DropTable(
                name: "purchase_returns");

            migrationBuilder.DropTable(
                name: "sales_returns");

            migrationBuilder.DropTable(
                name: "stock_issues");

            migrationBuilder.DropTable(
                name: "stock_receipts");

            migrationBuilder.DropTable(
                name: "stock_take_sessions");

            migrationBuilder.DropTable(
                name: "stock_transfers");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_Division_Number",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_Division_Number",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_Division_Number",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_GoodsReceiptNotes_Division_Number",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryOrders_Division_Number",
                table: "DeliveryOrders");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_EntityCode",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_Module_OccurredAtUtc",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_UserId_OccurredAtUtc",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "CommittedQuantity",
                table: "StockOnHand");

            migrationBuilder.DropColumn(
                name: "Division",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "BaseDocumentId",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseDocumentType",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseLineNumber",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseQuantity",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "Discount2Percent",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "Discount3Percent",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "QuantityCommitted",
                table: "SalesOrderLines");

            migrationBuilder.DropColumn(
                name: "Division",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "BaseDocumentId",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseDocumentType",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseLineNumber",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseQuantity",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "Discount2Percent",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "Discount3Percent",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "Division",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "PostedAtUtc",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "PostedByUserId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "TaxSerial",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "BaseDocumentId",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "BaseDocumentType",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "BaseLineNumber",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "BaseQuantity",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "Discount2Percent",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "Discount3Percent",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "Division",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropColumn(
                name: "BaseDocumentId",
                table: "GoodsReceiptLines");

            migrationBuilder.DropColumn(
                name: "BaseDocumentType",
                table: "GoodsReceiptLines");

            migrationBuilder.DropColumn(
                name: "BaseLineNumber",
                table: "GoodsReceiptLines");

            migrationBuilder.DropColumn(
                name: "BaseQuantity",
                table: "GoodsReceiptLines");

            migrationBuilder.DropColumn(
                name: "Discount2Percent",
                table: "GoodsReceiptLines");

            migrationBuilder.DropColumn(
                name: "Discount3Percent",
                table: "GoodsReceiptLines");

            migrationBuilder.DropColumn(
                name: "Division",
                table: "DeliveryOrders");

            migrationBuilder.DropColumn(
                name: "BaseDocumentId",
                table: "DeliveryOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseDocumentType",
                table: "DeliveryOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseLineNumber",
                table: "DeliveryOrderLines");

            migrationBuilder.DropColumn(
                name: "BaseQuantity",
                table: "DeliveryOrderLines");

            migrationBuilder.DropColumn(
                name: "Discount2Percent",
                table: "DeliveryOrderLines");

            migrationBuilder.DropColumn(
                name: "Discount3Percent",
                table: "DeliveryOrderLines");

            migrationBuilder.DropColumn(
                name: "ChangesJson",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "Module",
                table: "AuditLogs");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_Number",
                table: "SalesOrders",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Number",
                table: "PurchaseOrders",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Number",
                table: "Invoices",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptNotes_Number",
                table: "GoodsReceiptNotes",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryOrders_Number",
                table: "DeliveryOrders",
                column: "Number",
                unique: true);
        }
    }
}
