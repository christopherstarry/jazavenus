using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jaza.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AreaCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CollectorCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiscountCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistributionType",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fax",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroupOutletCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroupOutletTypeCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdNo",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NPWPDate",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutletType",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PKPDate",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PKPNumber",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone2",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PriceCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RegisteredAt",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SalesmanCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubTradeType",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TradeType",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseCode",
                table: "Customers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BrandDiscounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandCode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    DiscountPercent2 = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    PriceCode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
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
                    table.PrimaryKey("PK_BrandDiscounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BrandDiscounts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_IdNo",
                table: "Customers",
                column: "IdNo",
                filter: "\"IsDeleted\" = false AND \"IdNo\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BrandDiscounts_CustomerId",
                table: "BrandDiscounts",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BrandDiscounts");

            migrationBuilder.DropIndex(
                name: "IX_Customers_IdNo",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "AreaCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CollectorCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "DiscountCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "DistributionType",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Fax",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "GroupOutletCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "GroupOutletTypeCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "IdNo",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "NPWPDate",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "OutletType",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "PKPDate",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "PKPNumber",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Phone2",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "PriceCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "RegisteredAt",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "SalesmanCode",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "SubTradeType",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TradeType",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "WarehouseCode",
                table: "Customers");
        }
    }
}
