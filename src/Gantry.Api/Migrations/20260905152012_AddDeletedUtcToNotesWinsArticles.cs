using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gantry.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDeletedUtcToNotesWinsArticles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedUtc",
                table: "Wins",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedUtc",
                table: "Notes",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedUtc",
                table: "Articles",
                type: "timestamptz",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedUtc",
                table: "Wins");

            migrationBuilder.DropColumn(
                name: "DeletedUtc",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "DeletedUtc",
                table: "Articles");
        }
    }
}
