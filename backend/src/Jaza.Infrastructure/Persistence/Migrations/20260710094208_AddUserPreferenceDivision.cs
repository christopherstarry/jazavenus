using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jaza.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPreferenceDivision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Division",
                table: "UserPreferences",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Division",
                table: "UserPreferences");
        }
    }
}
