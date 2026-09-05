using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Pin;

[Trait("Category", "Integration")]
public class PinEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Pin_UnpinnedTodo_TogglesToPinned()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, isPinned: false);

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/pin", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.IsPinned.ShouldBeTrue();
    }

    [Fact]
    public async Task Pin_PinnedTodo_TogglesToUnpinned()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, isPinned: true);

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/pin", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.IsPinned.ShouldBeFalse();
    }

    [Fact]
    public async Task Pin_SoftDeletedTodo_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/pin", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Pin_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/todos/{Guid.NewGuid()}/pin", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }
}
