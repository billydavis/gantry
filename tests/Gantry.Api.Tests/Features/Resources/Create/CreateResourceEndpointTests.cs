using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Resources;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Resources.Create;

[Trait("Category", "Integration")]
public class CreateResourceEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_ValidGlobalResource_Returns201()
    {
        var response = await Client.PostAsJsonAsync("/api/resources", new
        {
            name = "Docs",
            location = "https://docs.example.com",
            type = "Documentation"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ResourceResponse>();
        body!.Name.ShouldBe("Docs");
        body.ProjectId.ShouldBeNull();
    }

    [Fact]
    public async Task Create_WithProjectAndEnvironment_LinksBoth()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        var environment = await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "Prod", projectId: project.Id);

        var response = await Client.PostAsJsonAsync("/api/resources", new
        {
            projectId = project.Id,
            environmentId = environment.Id,
            name = "Prod DB",
            location = "db.example.com",
            type = "Database"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ResourceResponse>();
        body!.ProjectId.ShouldBe(project.Id);
        body.EnvironmentId.ShouldBe(environment.Id);
        body.EnvironmentName.ShouldBe("Prod");
    }

    [Fact]
    public async Task Create_UnknownProjectId_Returns404WithMessage()
    {
        var response = await Client.PostAsJsonAsync("/api/resources", new
        {
            projectId = Guid.NewGuid(),
            name = "Name",
            location = "loc",
            type = "Website"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }

    [Fact]
    public async Task Create_UnknownEnvironmentId_Returns404WithMessage()
    {
        var response = await Client.PostAsJsonAsync("/api/resources", new
        {
            environmentId = Guid.NewGuid(),
            name = "Name",
            location = "loc",
            type = "Website"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Environment not found.\"");
    }

    [Fact]
    public async Task Create_InvalidType_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/resources", new
        {
            name = "Name",
            location = "loc",
            type = "NotAType"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Type");
    }
}
