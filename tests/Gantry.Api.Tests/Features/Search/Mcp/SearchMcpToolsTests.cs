using Gantry.Api.Features.Search.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Search.Mcp;

[Trait("Category", "Integration")]
public class SearchMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task Search_MatchingTodoTitle_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Find me via MCP search");

        var result = await SearchMcpTools.Search("MCP search", dbContext, CancellationToken.None);

        result.ShouldContain(r => r.Type == "Todo" && r.Title == "Find me via MCP search");
    }

    [Fact]
    public async Task Search_QueryTooShort_ReturnsEmpty()
    {
        await using var dbContext = CreateDbContext();

        var result = await SearchMcpTools.Search("a", dbContext, CancellationToken.None);

        result.ShouldBeEmpty();
    }
}
