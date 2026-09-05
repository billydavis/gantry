using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Create;

[Trait("Category", "Integration")]
public class CreateProjectEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_WithValidRequest_Returns201AndPersists()
    {
        var response = await Client.PostAsJsonAsync("/api/projects", new { name = "Gantry" });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Name.ShouldBe("Gantry");
        body.Status.ShouldBe("Active");
        response.Headers.Location.ShouldNotBeNull();
    }

    [Fact]
    public async Task Create_WithParentProjectId_PersistsRelationship()
    {
        await using var dbContext = CreateDbContext();
        var parent = await ProjectFactory.CreateProjectAsync(dbContext, "Parent");

        var response = await Client.PostAsJsonAsync("/api/projects", new { name = "Child", parentProjectId = parent.Id });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.ParentProjectId.ShouldBe(parent.Id);
    }

    [Fact]
    public async Task Create_MissingName_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/projects", new { name = "" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Name");
    }
}
