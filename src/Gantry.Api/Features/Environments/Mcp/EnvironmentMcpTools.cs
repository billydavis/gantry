using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Environments.Mcp;

[McpServerToolType]
public class EnvironmentMcpTools
{
    [McpServerTool(Name = "create_environment"), Description("Creates a new environment (e.g. Dev/Staging/Prod), optionally scoped to a project.")]
    public static async Task<EnvironmentResponse> CreateEnvironment(
        Create.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<EnvironmentResponse>(await Create.Endpoint.Handle(request, db, ct));

    [McpServerTool(Name = "update_environment"), Description("Updates an existing environment.")]
    public static async Task<EnvironmentResponse> UpdateEnvironment(
        [Description("The environment's id.")] Guid id,
        Update.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<EnvironmentResponse>(await Update.Endpoint.Handle(id, request, db, ct));

    [McpServerTool(Name = "list_environments"), Description("Lists environments, ordered by sort order then name.")]
    public static async Task<IEnumerable<EnvironmentResponse>> ListEnvironments(
        AppDbContext db,
        CancellationToken ct,
        [Description("Filter to a single project.")] Guid? projectId = null,
        [Description("Only return environments not scoped to any project.")] bool globalOnly = false)
        => McpResultAdapter.Unwrap<IEnumerable<EnvironmentResponse>>(await List.Endpoint.Handle(db, ct, projectId, globalOnly));
}
