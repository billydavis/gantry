using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Environments;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Environments.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_FiltersByProjectId()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "In project", projectId: project.Id);
        await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "Global");

        var response = await Client.GetAsync($"/api/environments?projectId={project.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<EnvironmentResponse[]>();
        body!.ShouldContain(e => e.Name == "In project");
        body!.ShouldNotContain(e => e.Name == "Global");
    }

    [Fact]
    public async Task List_GlobalOnlyTrue_ExcludesProjectScoped()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "In project", projectId: project.Id);
        await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "Global");

        var response = await Client.GetAsync("/api/environments?globalOnly=true");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<EnvironmentResponse[]>();
        body!.ShouldContain(e => e.Name == "Global");
        body!.ShouldNotContain(e => e.Name == "In project");
    }
}
