using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Timeline.Mcp;

[McpServerToolType]
public class TimelineMcpTools
{
    [McpServerTool(Name = "get_timeline"), Description("Gets the timeline (wins + completed todos) for a given month.")]
    public static async Task<IEnumerable<TimelineItem>> GetTimeline(
        [Description("Four-digit year.")] int year,
        [Description("Month, 1-12.")] int month,
        AppDbContext db)
        => McpResultAdapter.Unwrap<IEnumerable<TimelineItem>>(await TimelineEndpoints.Handle(db, year, month));
}
