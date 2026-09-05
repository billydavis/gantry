using System.Net.Http;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Quotes.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Quotes.Mcp;

/// <summary>
/// Only the cache-hit path is exercised (see GetTodayEndpointTests for why). A throwing
/// IHttpClientFactory stand-in guards that these tests never accidentally depend on a real
/// network call — if the tool ever reached the fetch path, the test would fail loudly instead of
/// silently succeeding/failing based on real network availability.
/// </summary>
[Trait("Category", "Integration")]
public class QuoteMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task GetTodayQuote_CachedQuoteForToday_ReturnsItWithoutFetching()
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

        var result = await QuoteMcpTools.GetTodayQuote(dbContext, new ThrowingHttpClientFactory(), CancellationToken.None);

        result.ShouldNotBeNull();
        result.Quote.ShouldBe("Test quote of the day.");
        result.Author.ShouldBe("Test Author");
    }

    private sealed class ThrowingHttpClientFactory : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) =>
            throw new InvalidOperationException(
                "This test expects the DailyQuotes cache-hit path; no HTTP client should be created.");
    }
}
