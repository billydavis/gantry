using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Reactivate;

[Trait("Category", "Integration")]
public class ReactivateEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Reactivate_ArchivedProject_SetsStatusToActive()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, status: ProjectStatus.Archived);

        var response = await Client.PostAsync($"/api/projects/{project.Id}/reactivate", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Status.ShouldBe("Active");
    }

    [Fact]
    public async Task Reactivate_CascadesToDescendants()
    {
        await using var dbContext = CreateDbContext();
        var parent = await ProjectFactory.CreateProjectAsync(dbContext, "Parent", ProjectStatus.OnHold);
        var child = await ProjectFactory.CreateProjectAsync(dbContext, "Child", ProjectStatus.OnHold, parent.Id);

        var response = await Client.PostAsync($"/api/projects/{parent.Id}/reactivate", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        await using var verifyContext = CreateDbContext();
        (await verifyContext.Projects.FindAsync(child.Id))!.Status.ShouldBe(ProjectStatus.Active);
    }

    [Fact]
    public async Task Reactivate_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/projects/{Guid.NewGuid()}/reactivate", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }
}
