using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Create;

[Trait("Category", "Integration")]
public class CreateTodoEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_WithValidRequest_Returns201AndPersists()
    {
        var response = await Client.PostAsJsonAsync("/api/todos", new
        {
            title = "Write the test plan",
            priority = "High"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Title.ShouldBe("Write the test plan");
        body.Priority.ShouldBe("High");
        body.Status.ShouldBe("Todo");
        response.Headers.Location.ShouldNotBeNull();
    }

    [Fact]
    public async Task Create_WithProjectId_LoadsProjectName()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext, "Gantry");

        var response = await Client.PostAsJsonAsync("/api/todos", new
        {
            projectId = project.Id,
            title = "Ship it"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.ProjectId.ShouldBe(project.Id);
        body.ProjectName.ShouldBe("Gantry");
    }

    [Fact]
    public async Task Create_MissingTitle_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/todos", new { title = "" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Title");
    }

    [Fact]
    public async Task Create_InvalidPriority_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/todos", new { title = "Title", priority = "NotAPriority" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Priority");
    }
}
