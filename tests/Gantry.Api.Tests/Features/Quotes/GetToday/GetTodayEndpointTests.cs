using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Quotes;
using Gantry.Api.Tests.Infrastructure;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Quotes.GetToday;

/// <summary>
/// Only the cache-hit path is tested. On a cache miss, the endpoint calls the "ZenQuotes" named
/// HttpClient over the real network (src/Gantry.Api/Features/Quotes/GetToday/Endpoint.cs) — that
/// path is intentionally left untested here since it would be a flaky/live network dependency.
/// </summary>
[Trait("Category", "Integration")]
public class GetTodayEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_CachedQuoteForToday_ReturnsItWithoutFetching()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await using var dbContext = CreateDbContext();
        dbContext.DailyQuotes.Add(new DailyQuote
        {
            Id = Guid.NewGuid(),
            Date = today,
            Quote = "Test quote of the day.",
            Author = "Test Author",
            CreatedUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/quotes/today");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<QuoteResponse>();
        body!.Quote.ShouldBe("Test quote of the day.");
        body.Author.ShouldBe("Test Author");
        body.Date.ShouldBe(today);
    }
}
