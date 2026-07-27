using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gantry.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "Tags",
                column: "Name",
                unique: true);

            migrationBuilder.CreateTable(
                name: "ProjectTags",
                columns: table => new
                {
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTags", x => new { x.ProjectId, x.TagId });
                    table.ForeignKey("FK_ProjectTags_Projects_ProjectId", x => x.ProjectId, "Projects", "Id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey("FK_ProjectTags_Tags_TagId", x => x.TagId, "Tags", "Id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TodoTags",
                columns: table => new
                {
                    TodoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoTags", x => new { x.TodoId, x.TagId });
                    table.ForeignKey("FK_TodoTags_Todos_TodoId", x => x.TodoId, "Todos", "Id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey("FK_TodoTags_Tags_TagId", x => x.TagId, "Tags", "Id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NoteTags",
                columns: table => new
                {
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteTags", x => new { x.NoteId, x.TagId });
                    table.ForeignKey("FK_NoteTags_Notes_NoteId", x => x.NoteId, "Notes", "Id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey("FK_NoteTags_Tags_TagId", x => x.TagId, "Tags", "Id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResourceTags",
                columns: table => new
                {
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceTags", x => new { x.ResourceId, x.TagId });
                    table.ForeignKey("FK_ResourceTags_Resources_ResourceId", x => x.ResourceId, "Resources", "Id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey("FK_ResourceTags_Tags_TagId", x => x.TagId, "Tags", "Id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WinTags",
                columns: table => new
                {
                    WinId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WinTags", x => new { x.WinId, x.TagId });
                    table.ForeignKey("FK_WinTags_Wins_WinId", x => x.WinId, "Wins", "Id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey("FK_WinTags_Tags_TagId", x => x.TagId, "Tags", "Id", onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ProjectTags");
            migrationBuilder.DropTable(name: "TodoTags");
            migrationBuilder.DropTable(name: "NoteTags");
            migrationBuilder.DropTable(name: "ResourceTags");
            migrationBuilder.DropTable(name: "WinTags");
            migrationBuilder.DropTable(name: "Tags");
        }
    }
}
