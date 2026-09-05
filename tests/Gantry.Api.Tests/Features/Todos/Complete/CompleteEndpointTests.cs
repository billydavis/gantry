using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Complete;

[Trait("Category", "Integration")]
public class CompleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Complete_ExistingTodo_SetsStatusAndCompletedUtc()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/complete", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Status.ShouldBe("Complete");
        body.CompletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Complete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/todos/{Guid.NewGuid()}/complete", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }
}
