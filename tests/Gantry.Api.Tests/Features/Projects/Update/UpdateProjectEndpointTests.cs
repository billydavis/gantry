using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Update;

[Trait("Category", "Integration")]
public class UpdateProjectEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/projects/{Guid.NewGuid()}", new { name = "Whatever" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }

    [Fact]
    public async Task Update_MissingName_Returns400WithFieldError()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}", new { name = "" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Name");
    }

    [Fact]
    public async Task Update_ValidRequest_PersistsChanges()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, "Old Name");

        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}", new { name = "New Name", color = "#fff" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Name.ShouldBe("New Name");
        body.Color.ShouldBe("#fff");
    }
}
