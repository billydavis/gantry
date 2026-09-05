using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Tags.Assign;
using Gantry.Api.Features.Tags.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateRequest = Gantry.Api.Features.Tags.Create.Request;
using UpdateRequest = Gantry.Api.Features.Tags.Update.Request;

namespace Gantry.Api.Tests.Features.Tags.Mcp;

[Trait("Category", "Integration")]
public class TagMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateTag_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await TagMcpTools.CreateTag(new CreateRequest("bug", "#ff6b6b"), dbContext);

        result.Name.ShouldBe("bug");
    }

    [Fact]
    public async Task CreateTag_DuplicateName_ThrowsMcpToolValidationExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();
        await TagFactory.CreateTagAsync(dbContext, name: "bug");

        var ex = await Should.ThrowAsync<McpToolValidationException>(
            () => TagMcpTools.CreateTag(new CreateRequest("bug", null), dbContext));

        ex.Message.ShouldBe("A tag with that name already exists.");
    }

    [Fact]
    public async Task UpdateTag_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => TagMcpTools.UpdateTag(Guid.NewGuid(), new UpdateRequest("Name", null), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Tag not found.");
    }

    [Fact]
    public async Task ListTags_ReturnsCreatedTag()
    {
        await using var dbContext = CreateDbContext();
        await TagFactory.CreateTagAsync(dbContext, name: "findable");

        var result = await TagMcpTools.ListTags(dbContext, CancellationToken.None);

        result.ShouldContain(t => t.Name == "findable");
    }

    [Fact]
    public async Task AssignTagsToProject_ReplacesFullSet()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        var tag = await TagFactory.CreateTagAsync(dbContext);

        var result = await TagMcpTools.AssignTagsToProject(project.Id, new AssignRequest([tag.Id]), dbContext);

        result.ShouldBe("Done.");
    }

    [Fact]
    public async Task AssignTagsToProject_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => TagMcpTools.AssignTagsToProject(Guid.NewGuid(), new AssignRequest([]), dbContext));

        ex.Message.ShouldBe("Project not found.");
    }

    [Fact]
    public async Task AssignTagsToTodo_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => TagMcpTools.AssignTagsToTodo(Guid.NewGuid(), new AssignRequest([]), dbContext));

        ex.Message.ShouldBe("Todo not found.");
    }

    [Fact]
    public async Task DeleteTag_Existing_ReturnsDone()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);

        var result = await TagMcpTools.DeleteTag(tag.Id, dbContext);

        result.ShouldBe("Done.");
    }

    [Fact]
    public async Task DeleteTag_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => TagMcpTools.DeleteTag(Guid.NewGuid(), dbContext));

        ex.Message.ShouldBe("Tag not found.");
    }

    [Fact]
    public async Task MergeTags_Valid_ReturnsTargetWithUsageCount()
    {
        await using var dbContext = CreateDbContext();
        var source = await TagFactory.CreateTagAsync(dbContext, name: "source");
        var target = await TagFactory.CreateTagAsync(dbContext, name: "target");
        var todo = await TodoFactory.CreateTodoAsync(dbContext);
        await TagFactory.AssignToTodoAsync(dbContext, todo, source);

        var result = await TagMcpTools.MergeTags(source.Id, target.Id, dbContext, CancellationToken.None);

        result.Id.ShouldBe(target.Id);
        result.UsageCount.ShouldBe(1);
    }

    [Fact]
    public async Task MergeTags_SourceEqualsTarget_ThrowsMcpToolValidationException()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);

        await Should.ThrowAsync<McpToolValidationException>(
            () => TagMcpTools.MergeTags(tag.Id, tag.Id, dbContext, CancellationToken.None));
    }

    [Fact]
    public async Task GetTagUsage_Existing_ReturnsTaggedItems()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);
        var todo = await TodoFactory.CreateTodoAsync(dbContext, title: "Tagged todo");
        await TagFactory.AssignToTodoAsync(dbContext, todo, tag);

        var result = await TagMcpTools.GetTagUsage(tag.Id, dbContext, CancellationToken.None);

        result.ShouldContain(r => r.Type == "Todo" && r.Id == todo.Id);
    }

    [Fact]
    public async Task GetTagUsage_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => TagMcpTools.GetTagUsage(Guid.NewGuid(), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Tag not found.");
    }
}
