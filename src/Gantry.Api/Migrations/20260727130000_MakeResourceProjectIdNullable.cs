using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gantry.Api.Migrations
{
    /// <inheritdoc />
    public partial class MakeResourceProjectIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectId",
                table: "Resources",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectId",
                table: "Resources",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true,
                oldType: "uuid");
        }
    }
}
