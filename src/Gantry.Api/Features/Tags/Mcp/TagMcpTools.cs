using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;
using Assign = Gantry.Api.Features.Tags.Assign;

namespace Gantry.Api.Features.Tags.Mcp;

[McpServerToolType]
public class TagMcpTools
{
    [McpServerTool(Name = "create_tag"), Description("Creates a new tag.")]
    public static async Task<TagResponse> CreateTag(Create.Request req, AppDbContext db)
        => McpResultAdapter.Unwrap<TagResponse>(await Create.Endpoint.Handle(req, db));

    [McpServerTool(Name = "update_tag"), Description("Updates an existing tag's name or color.")]
    public static async Task<TagResponse> UpdateTag(
        [Description("The tag's id.")] Guid id, Update.Request req, AppDbContext db)
        => McpResultAdapter.Unwrap<TagResponse>(await Update.Endpoint.Handle(id, req, db));

    [McpServerTool(Name = "list_tags"), Description("Lists all tags.")]
    public static async Task<IEnumerable<TagResponse>> ListTags(AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<IEnumerable<TagResponse>>(await List.Endpoint.Handle(db, ct));

    [McpServerTool(Name = "assign_tags_to_project"), Description("Replaces the full set of tags on a project.")]
    public static async Task<string> AssignTagsToProject(
        [Description("The project's id.")] Guid id, Assign.AssignRequest req, AppDbContext db)
        => McpResultAdapter.UnwrapNoContent(await Assign.Endpoint.AssignToProject(id, req, db));

    [McpServerTool(Name = "assign_tags_to_todo"), Description("Replaces the full set of tags on a todo.")]
    public static async Task<string> AssignTagsToTodo(
        [Description("The todo's id.")] Guid id, Assign.AssignRequest req, AppDbContext db)
        => McpResultAdapter.UnwrapNoContent(await Assign.Endpoint.AssignToTodo(id, req, db));

    [McpServerTool(Name = "assign_tags_to_note"), Description("Replaces the full set of tags on a note.")]
    public static async Task<string> AssignTagsToNote(
        [Description("The note's id.")] Guid id, Assign.AssignRequest req, AppDbContext db)
        => McpResultAdapter.UnwrapNoContent(await Assign.Endpoint.AssignToNote(id, req, db));

    [McpServerTool(Name = "assign_tags_to_resource"), Description("Replaces the full set of tags on a resource.")]
    public static async Task<string> AssignTagsToResource(
        [Description("The resource's id.")] Guid id, Assign.AssignRequest req, AppDbContext db)
        => McpResultAdapter.UnwrapNoContent(await Assign.Endpoint.AssignToResource(id, req, db));

    [McpServerTool(Name = "assign_tags_to_win"), Description("Replaces the full set of tags on a win.")]
    public static async Task<string> AssignTagsToWin(
        [Description("The win's id.")] Guid id, Assign.AssignRequest req, AppDbContext db)
        => McpResultAdapter.UnwrapNoContent(await Assign.Endpoint.AssignToWin(id, req, db));

    [McpServerTool(Name = "assign_tags_to_article"), Description("Replaces the full set of tags on an article (Knowledge Base / Wiki entry).")]
    public static async Task<string> AssignTagsToArticle(
        [Description("The article's id.")] Guid id, Assign.AssignRequest req, AppDbContext db)
        => McpResultAdapter.UnwrapNoContent(await Assign.Endpoint.AssignToArticle(id, req, db));
}
