using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Todos.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateRequest = Gantry.Api.Features.Todos.Create.Request;
using UpdateRequest = Gantry.Api.Features.Todos.Update.Request;

namespace Gantry.Api.Tests.Features.Todos.Mcp;

[Trait("Category", "Integration")]
public class TodoMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateTodo_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await TodoMcpTools.CreateTodo(
            new CreateRequest(null, "Ship it", null, null, null, null, null, null, null), dbContext, CancellationToken.None);

        result.Title.ShouldBe("Ship it");
    }

    [Fact]
    public async Task CreateTodo_InvalidPriority_ThrowsMcpToolValidationExceptionWithFieldMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpToolValidationException>(() => TodoMcpTools.CreateTodo(
            new CreateRequest(null, "x", null, null, "NotAPriority", null, null, null, null), dbContext, CancellationToken.None));

        ex.Message.ShouldContain("Priority:");
    }

    [Fact]
    public async Task GetTodo_NotFound_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => TodoMcpTools.GetTodo(Guid.NewGuid(), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Todo not found.");
    }

    [Fact]
    public async Task GetTodo_Existing_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, title: "Find me");

        var result = await TodoMcpTools.GetTodo(todo.Id, dbContext, CancellationToken.None);

        result.Title.ShouldBe("Find me");
    }

    [Fact]
    public async Task CompleteTodo_Existing_SetsCompletedUtc()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var result = await TodoMcpTools.CompleteTodo(todo.Id, dbContext, CancellationToken.None);

        result.Status.ShouldBe("Complete");
        result.CompletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task SoftDeleteTodo_Existing_ReturnsDone()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var result = await TodoMcpTools.SoftDeleteTodo(todo.Id, dbContext, CancellationToken.None);

        result.ShouldBe("Done.");
    }

    [Fact]
    public async Task UpdateTodo_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => TodoMcpTools.UpdateTodo(
            Guid.NewGuid(),
            new UpdateRequest(null, "Title", null, null, null, null, null, null, null, null),
            dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Todo not found.");
    }
}
