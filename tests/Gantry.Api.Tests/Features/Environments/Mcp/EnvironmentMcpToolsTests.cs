using Gantry.Api.Features.Environments.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateRequest = Gantry.Api.Features.Environments.Create.Request;
using UpdateRequest = Gantry.Api.Features.Environments.Update.Request;

namespace Gantry.Api.Tests.Features.Environments.Mcp;

[Trait("Category", "Integration")]
public class EnvironmentMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateEnvironment_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await EnvironmentMcpTools.CreateEnvironment(
            new CreateRequest(null, "Prod", null), dbContext, CancellationToken.None);

        result.Name.ShouldBe("Prod");
    }

    [Fact]
    public async Task UpdateEnvironment_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => EnvironmentMcpTools.UpdateEnvironment(
            Guid.NewGuid(), new UpdateRequest("Name", null, 0), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Environment not found.");
    }

    [Fact]
    public async Task ListEnvironments_ReturnsCreatedEnvironment()
    {
        await using var dbContext = CreateDbContext();
        await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "Findable");

        var result = await EnvironmentMcpTools.ListEnvironments(dbContext, CancellationToken.None);

        result.ShouldContain(e => e.Name == "Findable");
    }
}
