using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Quotes.Mcp;

[McpServerToolType]
public class QuoteMcpTools
{
    [McpServerTool(Name = "get_today_quote"), Description("Gets today's quote of the day, fetching and caching it if not already fetched. Returns null if none could be fetched.")]
    public static async Task<QuoteResponse?> GetTodayQuote(
        AppDbContext db, IHttpClientFactory httpClientFactory, CancellationToken ct)
        => McpResultAdapter.UnwrapOptional<QuoteResponse>(await GetToday.Endpoint.Handle(db, httpClientFactory, ct));
}
