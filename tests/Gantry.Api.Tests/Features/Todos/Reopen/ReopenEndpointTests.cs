using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Reopen;

[Trait("Category", "Integration")]
public class ReopenEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Reopen_CompletedTodo_ResetsStatusAndClearsCompletedUtc()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, status: TodoStatus.Complete);
        todo.CompletedUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/reopen", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Status.ShouldBe("Todo");
        body.CompletedUtc.ShouldBeNull();
    }

    [Fact]
    public async Task Reopen_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/todos/{Guid.NewGuid()}/reopen", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }
}
