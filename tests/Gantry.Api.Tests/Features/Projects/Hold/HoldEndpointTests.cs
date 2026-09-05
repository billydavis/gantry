using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Hold;

[Trait("Category", "Integration")]
public class HoldEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Hold_ExistingProject_SetsStatusToOnHold()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext);

        var response = await Client.PostAsync($"/api/projects/{project.Id}/hold", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Status.ShouldBe("OnHold");
    }

    [Fact]
    public async Task Hold_CascadesToDescendants()
    {
        await using var dbContext = CreateDbContext();
        var parent = await ProjectFactory.CreateProjectAsync(dbContext, "Parent");
        var child = await ProjectFactory.CreateProjectAsync(dbContext, "Child", parentProjectId: parent.Id);
        var grandchild = await ProjectFactory.CreateProjectAsync(dbContext, "Grandchild", parentProjectId: child.Id);

        var response = await Client.PostAsync($"/api/projects/{parent.Id}/hold", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        await using var verifyContext = CreateDbContext();
        (await verifyContext.Projects.FindAsync(child.Id))!.Status.ShouldBe(ProjectStatus.OnHold);
        (await verifyContext.Projects.FindAsync(grandchild.Id))!.Status.ShouldBe(ProjectStatus.OnHold);
    }

    [Fact]
    public async Task Hold_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/projects/{Guid.NewGuid()}/hold", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }
}
