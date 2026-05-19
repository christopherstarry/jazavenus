using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jaza.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddErrorLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ErrorLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    StackTrace = table.Column<string>(type: "text", nullable: true),
                    ExceptionType = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    StatusCode = table.Column<int>(type: "integer", nullable: false),
                    RequestPath = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    RequestMethod = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserName = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErrorLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLogs_ExceptionType",
                table: "ErrorLogs",
                column: "ExceptionType");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLogs_OccurredAtUtc",
                table: "ErrorLogs",
                column: "OccurredAtUtc");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ErrorLogs");
        }
    }
}
