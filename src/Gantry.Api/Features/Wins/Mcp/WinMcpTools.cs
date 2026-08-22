using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Wins.Mcp;

[McpServerToolType]
public class WinMcpTools
{
    [McpServerTool(Name = "create_win"), Description("Creates a new win (an accomplishment/impact entry).")]
    public static async Task<WinResponse> CreateWin(Create.Request req, AppDbContext db)
        => McpResultAdapter.Unwrap<WinResponse>(await Create.Endpoint.Handle(req, db));

    [McpServerTool(Name = "update_win"), Description("Updates an existing win.")]
    public static async Task<WinResponse> UpdateWin(
        [Description("The win's id.")] Guid id, Update.Request req, AppDbContext db)
        => McpResultAdapter.Unwrap<WinResponse>(await Update.Endpoint.Handle(id, req, db));

    [McpServerTool(Name = "list_wins"), Description("Lists wins, most recent first.")]
    public static async Task<IEnumerable<WinResponse>> ListWins(
        AppDbContext db,
        [Description("Filter to a single project.")] Guid? projectId = null,
        [Description("Maximum number of wins to return.")] int? limit = null)
        => McpResultAdapter.Unwrap<IEnumerable<WinResponse>>(await List.Endpoint.Handle(db, projectId, limit));

    [McpServerTool(Name = "get_win"), Description("Gets a single win by id.")]
    public static async Task<WinResponse> GetWin(
        [Description("The win's id.")] Guid id, AppDbContext db)
        => McpResultAdapter.Unwrap<WinResponse>(await GetById.Endpoint.Handle(id, db));
}
