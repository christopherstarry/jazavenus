using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jaza.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixForeignKeyBehaviors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ar_adjustments_Customers_CustomerId",
                table: "ar_adjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_credit_memo_lines_Items_ItemId",
                table: "credit_memo_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_credit_memos_Customers_CustomerId",
                table: "credit_memos");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrderLines_Items_ItemId",
                table: "DeliveryOrderLines");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrders_Customers_CustomerId",
                table: "DeliveryOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrders_SalesOrders_SalesOrderId",
                table: "DeliveryOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrders_Warehouses_WarehouseId",
                table: "DeliveryOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_extra_discount_lines_Brands_BrandId",
                table: "extra_discount_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_extra_discount_lines_Customers_CustomerId",
                table: "extra_discount_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_extra_discount_lines_Items_ItemId",
                table: "extra_discount_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptLines_Items_ItemId",
                table: "GoodsReceiptLines");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptNotes_PurchaseOrders_PurchaseOrderId",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptNotes_Suppliers_SupplierId",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptNotes_Warehouses_WarehouseId",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLines_Items_ItemId",
                table: "InvoiceLines");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Customers_CustomerId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_DeliveryOrders_DeliveryOrderId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_payment_allocations_Invoices_InvoiceId",
                table: "payment_allocations");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Invoices_InvoiceId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_post_dated_checks_Banks_BankId",
                table: "post_dated_checks");

            migrationBuilder.DropForeignKey(
                name: "FK_post_dated_checks_Customers_CustomerId",
                table: "post_dated_checks");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_return_lines_Items_ItemId",
                table: "purchase_return_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_returns_Suppliers_SupplierId",
                table: "purchase_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_returns_Warehouses_WarehouseId",
                table: "purchase_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrderLines_Items_ItemId",
                table: "PurchaseOrderLines");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Suppliers_SupplierId",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Warehouses_WarehouseId",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_return_lines_Items_ItemId",
                table: "sales_return_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_Customers_CustomerId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_DeliveryOrders_DeliveryOrderId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_Warehouses_WarehouseId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesOrderLines_Items_ItemId",
                table: "SalesOrderLines");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesOrders_Customers_CustomerId",
                table: "SalesOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesOrders_Warehouses_WarehouseId",
                table: "SalesOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_issue_lines_Items_ItemId",
                table: "stock_issue_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_issues_Warehouses_WarehouseId",
                table: "stock_issues");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_receipt_lines_Items_ItemId",
                table: "stock_receipt_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_receipts_Warehouses_WarehouseId",
                table: "stock_receipts");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_take_lines_Items_ItemId",
                table: "stock_take_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_take_sessions_Warehouses_WarehouseId",
                table: "stock_take_sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_transfer_lines_Items_ItemId",
                table: "stock_transfer_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_transfers_Warehouses_FromWarehouseId",
                table: "stock_transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_transfers_Warehouses_ToWarehouseId",
                table: "stock_transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Items_ItemId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Warehouses_WarehouseId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockOnHand_Items_ItemId",
                table: "StockOnHand");

            migrationBuilder.DropForeignKey(
                name: "FK_StockOnHand_Warehouses_WarehouseId",
                table: "StockOnHand");

            migrationBuilder.DropForeignKey(
                name: "FK_tax_invoice_serials_Invoices_InvoiceId",
                table: "tax_invoice_serials");

            migrationBuilder.DropForeignKey(
                name: "FK_tax_invoice_serials_TaxRegistrations_TaxRegistrationId",
                table: "tax_invoice_serials");

            migrationBuilder.DropIndex(
                name: "IX_stock_transfers_Division_Number",
                table: "stock_transfers");

            migrationBuilder.DropIndex(
                name: "IX_stock_take_sessions_Division_Number",
                table: "stock_take_sessions");

            migrationBuilder.DropIndex(
                name: "IX_stock_receipts_Division_Number",
                table: "stock_receipts");

            migrationBuilder.DropIndex(
                name: "IX_stock_issues_Division_Number",
                table: "stock_issues");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_Division_Number",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_sales_returns_Division_Number",
                table: "sales_returns");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_Division_Number",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_purchase_returns_Division_Number",
                table: "purchase_returns");

            migrationBuilder.DropIndex(
                name: "IX_post_dated_checks_Division_Number",
                table: "post_dated_checks");

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
                name: "IX_credit_memos_Division_Number",
                table: "credit_memos");

            migrationBuilder.DropIndex(
                name: "IX_ar_adjustments_Division_Number",
                table: "ar_adjustments");

            migrationBuilder.AlterColumn<Guid>(
                name: "InvoiceId",
                table: "Payments",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "Payments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "Payments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_tax_invoice_serials_CreditMemoId",
                table: "tax_invoice_serials",
                column: "CreditMemoId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfers_Division_Number",
                table: "stock_transfers",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_sessions_Division_Number",
                table: "stock_take_sessions",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipts_Division_Number",
                table: "stock_receipts",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_stock_issues_Division_Number",
                table: "stock_issues",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_Division_Number",
                table: "SalesOrders",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_Division_Number",
                table: "sales_returns",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_InvoiceId",
                table: "sales_returns",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Division_Number",
                table: "PurchaseOrders",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_returns_Division_Number",
                table: "purchase_returns",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_returns_GoodsReceiptNoteId",
                table: "purchase_returns",
                column: "GoodsReceiptNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_post_dated_checks_Division_Number",
                table: "post_dated_checks",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CustomerId",
                table: "Payments",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Division_Number",
                table: "Invoices",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptNotes_Division_Number",
                table: "GoodsReceiptNotes",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryOrders_Division_Number",
                table: "DeliveryOrders",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memos_Division_Number",
                table: "credit_memos",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memos_InvoiceId",
                table: "credit_memos",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_credit_memos_SalesReturnId",
                table: "credit_memos",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_ar_adjustments_Division_Number",
                table: "ar_adjustments",
                columns: new[] { "Division", "Number" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.AddForeignKey(
                name: "FK_ar_adjustments_Customers_CustomerId",
                table: "ar_adjustments",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_credit_memo_lines_Items_ItemId",
                table: "credit_memo_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_credit_memos_Customers_CustomerId",
                table: "credit_memos",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_credit_memos_Invoices_InvoiceId",
                table: "credit_memos",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_credit_memos_sales_returns_SalesReturnId",
                table: "credit_memos",
                column: "SalesReturnId",
                principalTable: "sales_returns",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrderLines_Items_ItemId",
                table: "DeliveryOrderLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrders_Customers_CustomerId",
                table: "DeliveryOrders",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrders_SalesOrders_SalesOrderId",
                table: "DeliveryOrders",
                column: "SalesOrderId",
                principalTable: "SalesOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrders_Warehouses_WarehouseId",
                table: "DeliveryOrders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_extra_discount_lines_Brands_BrandId",
                table: "extra_discount_lines",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_extra_discount_lines_Customers_CustomerId",
                table: "extra_discount_lines",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_extra_discount_lines_Items_ItemId",
                table: "extra_discount_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptLines_Items_ItemId",
                table: "GoodsReceiptLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptNotes_PurchaseOrders_PurchaseOrderId",
                table: "GoodsReceiptNotes",
                column: "PurchaseOrderId",
                principalTable: "PurchaseOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptNotes_Suppliers_SupplierId",
                table: "GoodsReceiptNotes",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptNotes_Warehouses_WarehouseId",
                table: "GoodsReceiptNotes",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLines_Items_ItemId",
                table: "InvoiceLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Customers_CustomerId",
                table: "Invoices",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_DeliveryOrders_DeliveryOrderId",
                table: "Invoices",
                column: "DeliveryOrderId",
                principalTable: "DeliveryOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_payment_allocations_Invoices_InvoiceId",
                table: "payment_allocations",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Customers_CustomerId",
                table: "Payments",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Invoices_InvoiceId",
                table: "Payments",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_post_dated_checks_Banks_BankId",
                table: "post_dated_checks",
                column: "BankId",
                principalTable: "Banks",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_post_dated_checks_Customers_CustomerId",
                table: "post_dated_checks",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_return_lines_Items_ItemId",
                table: "purchase_return_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_returns_GoodsReceiptNotes_GoodsReceiptNoteId",
                table: "purchase_returns",
                column: "GoodsReceiptNoteId",
                principalTable: "GoodsReceiptNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_returns_Suppliers_SupplierId",
                table: "purchase_returns",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_returns_Warehouses_WarehouseId",
                table: "purchase_returns",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrderLines_Items_ItemId",
                table: "PurchaseOrderLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Suppliers_SupplierId",
                table: "PurchaseOrders",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Warehouses_WarehouseId",
                table: "PurchaseOrders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_return_lines_Items_ItemId",
                table: "sales_return_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_Customers_CustomerId",
                table: "sales_returns",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_DeliveryOrders_DeliveryOrderId",
                table: "sales_returns",
                column: "DeliveryOrderId",
                principalTable: "DeliveryOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_Invoices_InvoiceId",
                table: "sales_returns",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_Warehouses_WarehouseId",
                table: "sales_returns",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrderLines_Items_ItemId",
                table: "SalesOrderLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_Customers_CustomerId",
                table: "SalesOrders",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_Warehouses_WarehouseId",
                table: "SalesOrders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_issue_lines_Items_ItemId",
                table: "stock_issue_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_issues_Warehouses_WarehouseId",
                table: "stock_issues",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_receipt_lines_Items_ItemId",
                table: "stock_receipt_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_receipts_Warehouses_WarehouseId",
                table: "stock_receipts",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_take_lines_Items_ItemId",
                table: "stock_take_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_take_sessions_Warehouses_WarehouseId",
                table: "stock_take_sessions",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_transfer_lines_Items_ItemId",
                table: "stock_transfer_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_transfers_Warehouses_FromWarehouseId",
                table: "stock_transfers",
                column: "FromWarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_transfers_Warehouses_ToWarehouseId",
                table: "stock_transfers",
                column: "ToWarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Items_ItemId",
                table: "StockMovements",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Warehouses_WarehouseId",
                table: "StockMovements",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockOnHand_Items_ItemId",
                table: "StockOnHand",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockOnHand_Warehouses_WarehouseId",
                table: "StockOnHand",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tax_invoice_serials_Invoices_InvoiceId",
                table: "tax_invoice_serials",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_tax_invoice_serials_TaxRegistrations_TaxRegistrationId",
                table: "tax_invoice_serials",
                column: "TaxRegistrationId",
                principalTable: "TaxRegistrations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tax_invoice_serials_credit_memos_CreditMemoId",
                table: "tax_invoice_serials",
                column: "CreditMemoId",
                principalTable: "credit_memos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ar_adjustments_Customers_CustomerId",
                table: "ar_adjustments");

            migrationBuilder.DropForeignKey(
                name: "FK_credit_memo_lines_Items_ItemId",
                table: "credit_memo_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_credit_memos_Customers_CustomerId",
                table: "credit_memos");

            migrationBuilder.DropForeignKey(
                name: "FK_credit_memos_Invoices_InvoiceId",
                table: "credit_memos");

            migrationBuilder.DropForeignKey(
                name: "FK_credit_memos_sales_returns_SalesReturnId",
                table: "credit_memos");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrderLines_Items_ItemId",
                table: "DeliveryOrderLines");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrders_Customers_CustomerId",
                table: "DeliveryOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrders_SalesOrders_SalesOrderId",
                table: "DeliveryOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryOrders_Warehouses_WarehouseId",
                table: "DeliveryOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_extra_discount_lines_Brands_BrandId",
                table: "extra_discount_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_extra_discount_lines_Customers_CustomerId",
                table: "extra_discount_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_extra_discount_lines_Items_ItemId",
                table: "extra_discount_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptLines_Items_ItemId",
                table: "GoodsReceiptLines");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptNotes_PurchaseOrders_PurchaseOrderId",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptNotes_Suppliers_SupplierId",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceiptNotes_Warehouses_WarehouseId",
                table: "GoodsReceiptNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLines_Items_ItemId",
                table: "InvoiceLines");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Customers_CustomerId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_DeliveryOrders_DeliveryOrderId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_payment_allocations_Invoices_InvoiceId",
                table: "payment_allocations");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Customers_CustomerId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Invoices_InvoiceId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_post_dated_checks_Banks_BankId",
                table: "post_dated_checks");

            migrationBuilder.DropForeignKey(
                name: "FK_post_dated_checks_Customers_CustomerId",
                table: "post_dated_checks");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_return_lines_Items_ItemId",
                table: "purchase_return_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_returns_GoodsReceiptNotes_GoodsReceiptNoteId",
                table: "purchase_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_returns_Suppliers_SupplierId",
                table: "purchase_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_returns_Warehouses_WarehouseId",
                table: "purchase_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrderLines_Items_ItemId",
                table: "PurchaseOrderLines");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Suppliers_SupplierId",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Warehouses_WarehouseId",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_return_lines_Items_ItemId",
                table: "sales_return_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_Customers_CustomerId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_DeliveryOrders_DeliveryOrderId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_Invoices_InvoiceId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_sales_returns_Warehouses_WarehouseId",
                table: "sales_returns");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesOrderLines_Items_ItemId",
                table: "SalesOrderLines");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesOrders_Customers_CustomerId",
                table: "SalesOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesOrders_Warehouses_WarehouseId",
                table: "SalesOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_issue_lines_Items_ItemId",
                table: "stock_issue_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_issues_Warehouses_WarehouseId",
                table: "stock_issues");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_receipt_lines_Items_ItemId",
                table: "stock_receipt_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_receipts_Warehouses_WarehouseId",
                table: "stock_receipts");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_take_lines_Items_ItemId",
                table: "stock_take_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_take_sessions_Warehouses_WarehouseId",
                table: "stock_take_sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_transfer_lines_Items_ItemId",
                table: "stock_transfer_lines");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_transfers_Warehouses_FromWarehouseId",
                table: "stock_transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_transfers_Warehouses_ToWarehouseId",
                table: "stock_transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Items_ItemId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Warehouses_WarehouseId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockOnHand_Items_ItemId",
                table: "StockOnHand");

            migrationBuilder.DropForeignKey(
                name: "FK_StockOnHand_Warehouses_WarehouseId",
                table: "StockOnHand");

            migrationBuilder.DropForeignKey(
                name: "FK_tax_invoice_serials_Invoices_InvoiceId",
                table: "tax_invoice_serials");

            migrationBuilder.DropForeignKey(
                name: "FK_tax_invoice_serials_TaxRegistrations_TaxRegistrationId",
                table: "tax_invoice_serials");

            migrationBuilder.DropForeignKey(
                name: "FK_tax_invoice_serials_credit_memos_CreditMemoId",
                table: "tax_invoice_serials");

            migrationBuilder.DropIndex(
                name: "IX_tax_invoice_serials_CreditMemoId",
                table: "tax_invoice_serials");

            migrationBuilder.DropIndex(
                name: "IX_stock_transfers_Division_Number",
                table: "stock_transfers");

            migrationBuilder.DropIndex(
                name: "IX_stock_take_sessions_Division_Number",
                table: "stock_take_sessions");

            migrationBuilder.DropIndex(
                name: "IX_stock_receipts_Division_Number",
                table: "stock_receipts");

            migrationBuilder.DropIndex(
                name: "IX_stock_issues_Division_Number",
                table: "stock_issues");

            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_Division_Number",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_sales_returns_Division_Number",
                table: "sales_returns");

            migrationBuilder.DropIndex(
                name: "IX_sales_returns_InvoiceId",
                table: "sales_returns");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_Division_Number",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_purchase_returns_Division_Number",
                table: "purchase_returns");

            migrationBuilder.DropIndex(
                name: "IX_purchase_returns_GoodsReceiptNoteId",
                table: "purchase_returns");

            migrationBuilder.DropIndex(
                name: "IX_post_dated_checks_Division_Number",
                table: "post_dated_checks");

            migrationBuilder.DropIndex(
                name: "IX_Payments_CustomerId",
                table: "Payments");

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
                name: "IX_credit_memos_Division_Number",
                table: "credit_memos");

            migrationBuilder.DropIndex(
                name: "IX_credit_memos_InvoiceId",
                table: "credit_memos");

            migrationBuilder.DropIndex(
                name: "IX_credit_memos_SalesReturnId",
                table: "credit_memos");

            migrationBuilder.DropIndex(
                name: "IX_ar_adjustments_Division_Number",
                table: "ar_adjustments");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "Division",
                table: "Payments");

            migrationBuilder.AlterColumn<Guid>(
                name: "InvoiceId",
                table: "Payments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_transfers_Division_Number",
                table: "stock_transfers",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_take_sessions_Division_Number",
                table: "stock_take_sessions",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_receipts_Division_Number",
                table: "stock_receipts",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_issues_Division_Number",
                table: "stock_issues",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_Division_Number",
                table: "SalesOrders",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_returns_Division_Number",
                table: "sales_returns",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Division_Number",
                table: "PurchaseOrders",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_returns_Division_Number",
                table: "purchase_returns",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_dated_checks_Division_Number",
                table: "post_dated_checks",
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
                name: "IX_credit_memos_Division_Number",
                table: "credit_memos",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ar_adjustments_Division_Number",
                table: "ar_adjustments",
                columns: new[] { "Division", "Number" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ar_adjustments_Customers_CustomerId",
                table: "ar_adjustments",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_credit_memo_lines_Items_ItemId",
                table: "credit_memo_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_credit_memos_Customers_CustomerId",
                table: "credit_memos",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrderLines_Items_ItemId",
                table: "DeliveryOrderLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrders_Customers_CustomerId",
                table: "DeliveryOrders",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrders_SalesOrders_SalesOrderId",
                table: "DeliveryOrders",
                column: "SalesOrderId",
                principalTable: "SalesOrders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryOrders_Warehouses_WarehouseId",
                table: "DeliveryOrders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_extra_discount_lines_Brands_BrandId",
                table: "extra_discount_lines",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_extra_discount_lines_Customers_CustomerId",
                table: "extra_discount_lines",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_extra_discount_lines_Items_ItemId",
                table: "extra_discount_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptLines_Items_ItemId",
                table: "GoodsReceiptLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptNotes_PurchaseOrders_PurchaseOrderId",
                table: "GoodsReceiptNotes",
                column: "PurchaseOrderId",
                principalTable: "PurchaseOrders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptNotes_Suppliers_SupplierId",
                table: "GoodsReceiptNotes",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceiptNotes_Warehouses_WarehouseId",
                table: "GoodsReceiptNotes",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLines_Items_ItemId",
                table: "InvoiceLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Customers_CustomerId",
                table: "Invoices",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_DeliveryOrders_DeliveryOrderId",
                table: "Invoices",
                column: "DeliveryOrderId",
                principalTable: "DeliveryOrders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_payment_allocations_Invoices_InvoiceId",
                table: "payment_allocations",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Invoices_InvoiceId",
                table: "Payments",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_post_dated_checks_Banks_BankId",
                table: "post_dated_checks",
                column: "BankId",
                principalTable: "Banks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_post_dated_checks_Customers_CustomerId",
                table: "post_dated_checks",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_return_lines_Items_ItemId",
                table: "purchase_return_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_returns_Suppliers_SupplierId",
                table: "purchase_returns",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_returns_Warehouses_WarehouseId",
                table: "purchase_returns",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrderLines_Items_ItemId",
                table: "PurchaseOrderLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Suppliers_SupplierId",
                table: "PurchaseOrders",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Warehouses_WarehouseId",
                table: "PurchaseOrders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_return_lines_Items_ItemId",
                table: "sales_return_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_Customers_CustomerId",
                table: "sales_returns",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_DeliveryOrders_DeliveryOrderId",
                table: "sales_returns",
                column: "DeliveryOrderId",
                principalTable: "DeliveryOrders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_sales_returns_Warehouses_WarehouseId",
                table: "sales_returns",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrderLines_Items_ItemId",
                table: "SalesOrderLines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_Customers_CustomerId",
                table: "SalesOrders",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_Warehouses_WarehouseId",
                table: "SalesOrders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_issue_lines_Items_ItemId",
                table: "stock_issue_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_issues_Warehouses_WarehouseId",
                table: "stock_issues",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_receipt_lines_Items_ItemId",
                table: "stock_receipt_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_receipts_Warehouses_WarehouseId",
                table: "stock_receipts",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_take_lines_Items_ItemId",
                table: "stock_take_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_take_sessions_Warehouses_WarehouseId",
                table: "stock_take_sessions",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_transfer_lines_Items_ItemId",
                table: "stock_transfer_lines",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_transfers_Warehouses_FromWarehouseId",
                table: "stock_transfers",
                column: "FromWarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_transfers_Warehouses_ToWarehouseId",
                table: "stock_transfers",
                column: "ToWarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Items_ItemId",
                table: "StockMovements",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Warehouses_WarehouseId",
                table: "StockMovements",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockOnHand_Items_ItemId",
                table: "StockOnHand",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockOnHand_Warehouses_WarehouseId",
                table: "StockOnHand",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tax_invoice_serials_Invoices_InvoiceId",
                table: "tax_invoice_serials",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_tax_invoice_serials_TaxRegistrations_TaxRegistrationId",
                table: "tax_invoice_serials",
                column: "TaxRegistrationId",
                principalTable: "TaxRegistrations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
