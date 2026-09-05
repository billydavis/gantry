using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Resources;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Resources.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_FiltersByProjectId()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await ResourceFactory.CreateResourceAsync(dbContext, name: "In project", projectId: project.Id);
        await ResourceFactory.CreateResourceAsync(dbContext, name: "Global");

        var response = await Client.GetAsync($"/api/resources?projectId={project.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ResourceResponse[]>();
        body!.ShouldContain(r => r.Name == "In project");
        body!.ShouldNotContain(r => r.Name == "Global");
    }

    [Fact]
    public async Task List_GlobalOnlyTrue_ExcludesProjectScoped()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await ResourceFactory.CreateResourceAsync(dbContext, name: "In project", projectId: project.Id);
        await ResourceFactory.CreateResourceAsync(dbContext, name: "Global");

        var response = await Client.GetAsync("/api/resources?globalOnly=true");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ResourceResponse[]>();
        body!.ShouldContain(r => r.Name == "Global");
        body!.ShouldNotContain(r => r.Name == "In project");
    }

    [Fact]
    public async Task List_OrdersBySortOrderThenName()
    {
        await using var dbContext = CreateDbContext();
        await ResourceFactory.CreateResourceAsync(dbContext, name: "Zebra", sortOrder: 0);
        await ResourceFactory.CreateResourceAsync(dbContext, name: "Apple", sortOrder: 0);

        var response = await Client.GetAsync("/api/resources");

        var body = await response.Content.ReadFromJsonAsync<ResourceResponse[]>();
        body!.First().Name.ShouldBe("Apple");
    }
}
