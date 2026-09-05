using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gantry.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTodoRecurrence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecurrenceIntervalDays",
                table: "Todos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RecurrenceParentId",
                table: "Todos",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceType",
                table: "Todos",
                type: "text",
                nullable: false,
                defaultValue: "None");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecurrenceIntervalDays",
                table: "Todos");

            migrationBuilder.DropColumn(
                name: "RecurrenceParentId",
                table: "Todos");

            migrationBuilder.DropColumn(
                name: "RecurrenceType",
                table: "Todos");
        }
    }
}
