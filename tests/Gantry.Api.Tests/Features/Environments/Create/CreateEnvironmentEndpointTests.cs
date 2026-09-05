using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Environments;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Environments.Create;

[Trait("Category", "Integration")]
public class CreateEnvironmentEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_ValidGlobalEnvironment_Returns201()
    {
        var response = await Client.PostAsJsonAsync("/api/environments", new { name = "Prod" });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<EnvironmentResponse>();
        body!.Name.ShouldBe("Prod");
        body.ProjectId.ShouldBeNull();
    }

    [Fact]
    public async Task Create_WithProjectId_LinksProject()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);

        var response = await Client.PostAsJsonAsync("/api/environments", new { projectId = project.Id, name = "Staging" });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<EnvironmentResponse>();
        body!.ProjectId.ShouldBe(project.Id);
    }

    [Fact]
    public async Task Create_UnknownProjectId_Returns404WithMessage()
    {
        var response = await Client.PostAsJsonAsync("/api/environments", new { projectId = Guid.NewGuid(), name = "Staging" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }

    [Fact]
    public async Task Create_MissingName_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/environments", new { name = "" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Name");
    }
}
