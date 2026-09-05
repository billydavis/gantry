using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_ExcludesCompletedByDefault()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Open", status: TodoStatus.Todo);
        await TodoFactory.CreateTodoAsync(dbContext, title: "Done", status: TodoStatus.Complete);

        var response = await Client.GetAsync("/api/todos");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse[]>();
        body!.ShouldContain(t => t.Title == "Open");
        body!.ShouldNotContain(t => t.Title == "Done");
    }

    [Fact]
    public async Task List_IncludeCompletedTrue_IncludesCompleted()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Done", status: TodoStatus.Complete);

        var response = await Client.GetAsync("/api/todos?includeCompleted=true");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse[]>();
        body!.ShouldContain(t => t.Title == "Done");
    }

    [Fact]
    public async Task List_ExcludesSoftDeleted()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Deleted", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/todos?includeCompleted=true");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse[]>();
        body!.ShouldNotContain(t => t.Title == "Deleted");
    }

    [Fact]
    public async Task List_FiltersByProjectId()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await TodoFactory.CreateTodoAsync(dbContext, title: "In project", projectId: project.Id);
        await TodoFactory.CreateTodoAsync(dbContext, title: "No project");

        var response = await Client.GetAsync($"/api/todos?projectId={project.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse[]>();
        body!.ShouldContain(t => t.Title == "In project");
        body!.ShouldNotContain(t => t.Title == "No project");
    }

    [Fact]
    public async Task List_PinnedTodosSortFirst()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Unpinned");
        await TodoFactory.CreateTodoAsync(dbContext, title: "Pinned", isPinned: true);

        var response = await Client.GetAsync("/api/todos");

        var body = await response.Content.ReadFromJsonAsync<TodoResponse[]>();
        body!.First().Title.ShouldBe("Pinned");
    }
}
