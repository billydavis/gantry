using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Search.Mcp;

[McpServerToolType]
public class SearchMcpTools
{
    [McpServerTool(Name = "search"), Description("Full-text-ish search across projects, todos, notes, wins, resources, and articles.")]
    public static async Task<IEnumerable<SearchResult>> Search(
        [Description("The search query. Must be at least 2 characters.")] string q,
        AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<IEnumerable<SearchResult>>(await SearchEndpoints.Handle(db, q, ct));
}
