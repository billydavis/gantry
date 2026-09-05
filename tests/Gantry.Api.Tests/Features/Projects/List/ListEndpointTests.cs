using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_IncludesArchivedAndOnHoldProjects()
    {
        await using var dbContext = CreateDbContext();
        await ProjectFactory.CreateProjectAsync(dbContext, "Active One", ProjectStatus.Active);
        await ProjectFactory.CreateProjectAsync(dbContext, "Archived One", ProjectStatus.Archived);
        await ProjectFactory.CreateProjectAsync(dbContext, "On Hold One", ProjectStatus.OnHold);

        var response = await Client.GetAsync("/api/projects");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse[]>();
        body!.ShouldContain(p => p.Name == "Active One");
        body!.ShouldContain(p => p.Name == "Archived One");
        body!.ShouldContain(p => p.Name == "On Hold One");
    }

    [Fact]
    public async Task List_OrdersByName()
    {
        await using var dbContext = CreateDbContext();
        await ProjectFactory.CreateProjectAsync(dbContext, "Zebra");
        await ProjectFactory.CreateProjectAsync(dbContext, "Alpha");

        var response = await Client.GetAsync("/api/projects");

        var body = await response.Content.ReadFromJsonAsync<ProjectResponse[]>();
        body!.First().Name.ShouldBe("Alpha");
    }
}
