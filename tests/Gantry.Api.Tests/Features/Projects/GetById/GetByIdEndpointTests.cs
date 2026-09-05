using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.GetById;

[Trait("Category", "Integration")]
public class GetByIdEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_ExistingProject_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, "Find me");

        var response = await Client.GetAsync($"/api/projects/{project.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Name.ShouldBe("Find me");
    }

    [Fact]
    public async Task Get_UnknownId_Returns404WithMessage()
    {
        var response = await Client.GetAsync($"/api/projects/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }
}
