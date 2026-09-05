using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Update;

[Trait("Category", "Integration")]
public class UpdateTodoEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/todos/{Guid.NewGuid()}", new { title = "Whatever" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }

    [Fact]
    public async Task Update_MissingTitle_Returns400WithFieldError()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/todos/{todo.Id}", new { title = "" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Title");
    }

    [Fact]
    public async Task Update_StatusToComplete_StampsCompletedUtc()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/todos/{todo.Id}", new
        {
            title = todo.Title,
            status = "Complete"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Status.ShouldBe("Complete");
        body.CompletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Update_StatusAwayFromComplete_ClearsCompletedUtc()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, status: TodoStatus.Complete);
        todo.CompletedUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        var response = await Client.PutAsJsonAsync($"/api/todos/{todo.Id}", new
        {
            title = todo.Title,
            status = "Todo"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Status.ShouldBe("Todo");
        body.CompletedUtc.ShouldBeNull();
    }
}
