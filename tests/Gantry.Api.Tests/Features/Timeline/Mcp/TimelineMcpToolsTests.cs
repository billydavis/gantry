using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Timeline.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Timeline.Mcp;

[Trait("Category", "Integration")]
public class TimelineMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task GetTimeline_WinInMonth_IsIncluded()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Wins.Add(new Win
        {
            Id = Guid.NewGuid(),
            Title = "MCP timeline win",
            Date = new DateOnly(2026, 3, 15),
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var result = await TimelineMcpTools.GetTimeline(2026, 3, dbContext);

        result.ShouldContain(i => i.Type == "Win" && i.Title == "MCP timeline win");
    }

    [Fact]
    public async Task GetTimeline_NoActivityInMonth_ReturnsEmpty()
    {
        await using var dbContext = CreateDbContext();

        var result = await TimelineMcpTools.GetTimeline(2019, 1, dbContext);

        result.ShouldBeEmpty();
    }
}
