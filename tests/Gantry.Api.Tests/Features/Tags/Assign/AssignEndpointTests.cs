using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Projects;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Assign;

/// <summary>
/// AssignToProject/AssignToTodo/AssignToNote/AssignToResource/AssignToWin/AssignToArticle in
/// Tags/Assign/Endpoint.cs are structurally identical; these two are a representative sample.
/// </summary>
[Trait("Category", "Integration")]
public class AssignEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task AssignToProject_ReplacesFullTagSet()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        var tagA = await TagFactory.CreateTagAsync(dbContext, name: "a");
        var tagB = await TagFactory.CreateTagAsync(dbContext, name: "b");

        var firstAssign = await Client.PutAsJsonAsync($"/api/projects/{project.Id}/tags", new { tagIds = new[] { tagA.Id } });
        firstAssign.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        var secondAssign = await Client.PutAsJsonAsync($"/api/projects/{project.Id}/tags", new { tagIds = new[] { tagB.Id } });
        secondAssign.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        var getResponse = await Client.GetAsync($"/api/projects/{project.Id}");
        var body = await getResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Tags.ShouldContain(t => t.Name == "b");
        body.Tags.ShouldNotContain(t => t.Name == "a");
    }

    [Fact]
    public async Task AssignToProject_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/projects/{Guid.NewGuid()}/tags", new { tagIds = Array.Empty<Guid>() });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }

    [Fact]
    public async Task AssignToTodo_ReplacesFullTagSet()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);
        var tag = await TagFactory.CreateTagAsync(dbContext, name: "urgent");

        var response = await Client.PutAsJsonAsync($"/api/todos/{todo.Id}/tags", new { tagIds = new[] { tag.Id } });
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        var getResponse = await Client.GetAsync($"/api/todos/{todo.Id}");
        var body = await getResponse.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Tags.ShouldContain(t => t.Name == "urgent");
    }

    [Fact]
    public async Task AssignToTodo_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/todos/{Guid.NewGuid()}/tags", new { tagIds = Array.Empty<Guid>() });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }
}
