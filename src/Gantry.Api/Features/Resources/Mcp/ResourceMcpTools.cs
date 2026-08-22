using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Resources.Reorder;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Resources.Mcp;

[McpServerToolType]
public class ResourceMcpTools
{
    [McpServerTool(Name = "create_resource"), Description("Creates a new resource (a URL, file path, or other link, optionally scoped to a project and/or environment).")]
    public static async Task<ResourceResponse> CreateResource(
        Create.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ResourceResponse>(await Create.Endpoint.Handle(request, db, ct));

    [McpServerTool(Name = "update_resource"), Description("Updates an existing resource.")]
    public static async Task<ResourceResponse> UpdateResource(
        [Description("The resource's id.")] Guid id,
        Update.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ResourceResponse>(await Update.Endpoint.Handle(id, request, db, ct));

    [McpServerTool(Name = "list_resources"), Description("Lists resources, ordered by sort order then name.")]
    public static async Task<IEnumerable<ResourceResponse>> ListResources(
        AppDbContext db,
        CancellationToken ct,
        [Description("Filter to a single project.")] Guid? projectId = null,
        [Description("Only return resources not scoped to any project.")] bool globalOnly = false)
        => McpResultAdapter.Unwrap<IEnumerable<ResourceResponse>>(await List.Endpoint.Handle(db, ct, projectId, globalOnly));

    [McpServerTool(Name = "reorder_resources"), Description("Bulk-updates the sort order of a set of resources.")]
    public static async Task<string> ReorderResources(
        List<ReorderItem> items, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.UnwrapNoContent(await Reorder.Endpoint.Handle(items, db, ct));
}
