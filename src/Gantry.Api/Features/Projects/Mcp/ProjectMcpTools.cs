using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Projects.Mcp;

[McpServerToolType]
public class ProjectMcpTools
{
    [McpServerTool(Name = "create_project"), Description("Creates a new project.")]
    public static async Task<ProjectResponse> CreateProject(
        Create.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ProjectResponse>(await Create.Endpoint.Handle(request, db, ct));

    [McpServerTool(Name = "update_project"), Description("Updates an existing project's name, description, parent, color, or settings.")]
    public static async Task<ProjectResponse> UpdateProject(
        [Description("The project's id.")] Guid id,
        Update.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ProjectResponse>(await Update.Endpoint.Handle(id, request, db, ct));

    [McpServerTool(Name = "list_projects"), Description("Lists all projects, including archived and on-hold ones.")]
    public static async Task<IEnumerable<ProjectResponse>> ListProjects(AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<IEnumerable<ProjectResponse>>(await List.Endpoint.Handle(db, ct));

    [McpServerTool(Name = "get_project"), Description("Gets a single project by id.")]
    public static async Task<ProjectResponse> GetProject(
        [Description("The project's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ProjectResponse>(await GetById.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "archive_project"), Description("Archives a project and all of its descendant projects. Reversible via reactivate_project.")]
    public static async Task<ProjectResponse> ArchiveProject(
        [Description("The project's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ProjectResponse>(await Archive.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "reactivate_project"), Description("Reactivates an archived or on-hold project and all of its descendant projects.")]
    public static async Task<ProjectResponse> ReactivateProject(
        [Description("The project's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ProjectResponse>(await Reactivate.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "hold_project"), Description("Puts a project and all of its descendant projects on hold. Reversible via reactivate_project.")]
    public static async Task<ProjectResponse> HoldProject(
        [Description("The project's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ProjectResponse>(await Hold.Endpoint.Handle(id, db, ct));
}
