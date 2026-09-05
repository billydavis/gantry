using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.GetById;

[Trait("Category", "Integration")]
public class GetByIdEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_ExistingTodo_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, title: "Find me");

        var response = await Client.GetAsync($"/api/todos/{todo.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Title.ShouldBe("Find me");
    }

    [Fact]
    public async Task Get_UnknownId_Returns404WithMessage()
    {
        var response = await Client.GetAsync($"/api/todos/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }

    [Fact]
    public async Task Get_SoftDeletedTodo_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync($"/api/todos/{todo.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}
