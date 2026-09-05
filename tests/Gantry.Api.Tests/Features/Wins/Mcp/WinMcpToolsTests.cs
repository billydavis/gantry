using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Wins.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateRequest = Gantry.Api.Features.Wins.Create.Request;
using UpdateRequest = Gantry.Api.Features.Wins.Update.Request;

namespace Gantry.Api.Tests.Features.Wins.Mcp;

[Trait("Category", "Integration")]
public class WinMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateWin_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await WinMcpTools.CreateWin(
            new CreateRequest("Shipped it", null, null, DateOnly.FromDateTime(DateTime.UtcNow), null), dbContext);

        result.Title.ShouldBe("Shipped it");
    }

    [Fact]
    public async Task CreateWin_MissingTitle_ThrowsMcpToolValidationExceptionWithFieldMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpToolValidationException>(() => WinMcpTools.CreateWin(
            new CreateRequest("", null, null, DateOnly.FromDateTime(DateTime.UtcNow), null), dbContext));

        ex.Message.ShouldContain("Title:");
    }

    [Fact]
    public async Task GetWin_NotFound_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => WinMcpTools.GetWin(Guid.NewGuid(), dbContext));

        ex.Message.ShouldBe("Win not found.");
    }

    [Fact]
    public async Task UpdateWin_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => WinMcpTools.UpdateWin(
            Guid.NewGuid(),
            new UpdateRequest("Title", null, null, DateOnly.FromDateTime(DateTime.UtcNow), null),
            dbContext));

        ex.Message.ShouldBe("Win not found.");
    }

    [Fact]
    public async Task ListWins_ReturnsCreatedWin()
    {
        await using var dbContext = CreateDbContext();
        var win = await WinFactory.CreateWinAsync(dbContext, title: "Findable");

        var result = await WinMcpTools.ListWins(dbContext);

        result.ShouldContain(w => w.Id == win.Id);
    }
}
