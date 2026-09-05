using System.Net;
using Gantry.Api.Data.Entities;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_ExistingTodo_SoftDeletesIt()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var response = await Client.DeleteAsync($"/api/todos/{todo.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await using var verifyContext = CreateDbContext();
        var persisted = await verifyContext.Todos.FirstAsync(t => t.Id == todo.Id);
        persisted.DeletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Delete_AlreadyDeletedTodo_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.DeleteAsync($"/api/todos/{todo.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.DeleteAsync($"/api/todos/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }
}
