using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Projects;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Archive;

[Trait("Category", "Integration")]
public class ArchiveEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Archive_ExistingProject_SetsStatusToArchived()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext);

        var response = await Client.PostAsync($"/api/projects/{project.Id}/archive", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        body!.Status.ShouldBe("Archived");
    }

    [Fact]
    public async Task Archive_CascadesToDescendants()
    {
        await using var dbContext = CreateDbContext();
        var parent = await ProjectFactory.CreateProjectAsync(dbContext, "Parent");
        var child = await ProjectFactory.CreateProjectAsync(dbContext, "Child", parentProjectId: parent.Id);

        var response = await Client.PostAsync($"/api/projects/{parent.Id}/archive", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        await using var verifyContext = CreateDbContext();
        (await verifyContext.Projects.FindAsync(child.Id))!.Status.ShouldBe(ProjectStatus.Archived);
    }

    [Fact]
    public async Task Archive_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/projects/{Guid.NewGuid()}/archive", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }
}
