using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Resources.Mcp;
using Gantry.Api.Features.Resources.Reorder;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateRequest = Gantry.Api.Features.Resources.Create.Request;
using UpdateRequest = Gantry.Api.Features.Resources.Update.Request;

namespace Gantry.Api.Tests.Features.Resources.Mcp;

[Trait("Category", "Integration")]
public class ResourceMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateResource_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await ResourceMcpTools.CreateResource(
            new CreateRequest(null, "Docs", "https://example.com", "Documentation", null), dbContext, CancellationToken.None);

        result.Name.ShouldBe("Docs");
    }

    [Fact]
    public async Task CreateResource_InvalidType_ThrowsMcpToolValidationExceptionWithFieldMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpToolValidationException>(() => ResourceMcpTools.CreateResource(
            new CreateRequest(null, "Name", "loc", "NotAType", null), dbContext, CancellationToken.None));

        ex.Message.ShouldContain("Type:");
    }

    [Fact]
    public async Task UpdateResource_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => ResourceMcpTools.UpdateResource(
            Guid.NewGuid(), new UpdateRequest("Name", "loc", "Website", null, 0), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Resource not found.");
    }

    [Fact]
    public async Task ListResources_ReturnsCreatedResource()
    {
        await using var dbContext = CreateDbContext();
        await ResourceFactory.CreateResourceAsync(dbContext, name: "Findable");

        var result = await ResourceMcpTools.ListResources(dbContext, CancellationToken.None);

        result.ShouldContain(r => r.Name == "Findable");
    }

    [Fact]
    public async Task ReorderResources_Valid_ReturnsDone()
    {
        await using var dbContext = CreateDbContext();
        var resource = await ResourceFactory.CreateResourceAsync(dbContext);

        var result = await ResourceMcpTools.ReorderResources(
            [new ReorderItem(resource.Id, 3)], dbContext, CancellationToken.None);

        result.ShouldBe("Done.");
    }
}
