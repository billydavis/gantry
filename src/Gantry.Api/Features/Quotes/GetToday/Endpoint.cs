using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Gantry.Api.Data;
using Entities = Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Quotes.GetToday;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/quotes/today", Handle).WithName("GetTodayQuote");

    private static async Task<IResult> Handle(AppDbContext db, IHttpClientFactory httpClientFactory, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var existing = await db.DailyQuotes.FirstOrDefaultAsync(q => q.Date == today, ct);
        if (existing is not null)
            return Results.Ok(QuoteResponse.FromEntity(existing));

        var client = httpClientFactory.CreateClient("ZenQuotes");
        List<ZenQuoteDto>? quotes;
        try
        {
            quotes = await client.GetFromJsonAsync<List<ZenQuoteDto>>("/api/today", ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            quotes = null;
        }

        var fetched = quotes?.FirstOrDefault();
        if (fetched is null || string.IsNullOrWhiteSpace(fetched.Q))
            return Results.NoContent();

        var entity = new Entities.DailyQuote
        {
            Id = Guid.NewGuid(),
            Date = today,
            Quote = fetched.Q,
            Author = fetched.A,
            CreatedUtc = DateTime.UtcNow,
        };
        db.DailyQuotes.Add(entity);
        await db.SaveChangesAsync(ct);

        return Results.Ok(QuoteResponse.FromEntity(entity));
    }

    private record ZenQuoteDto(
        [property: JsonPropertyName("q")] string Q,
        [property: JsonPropertyName("a")] string A);
}
