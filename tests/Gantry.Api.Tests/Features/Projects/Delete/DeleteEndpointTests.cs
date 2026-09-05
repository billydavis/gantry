using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsJsonAsync($"/api/projects/{Guid.NewGuid()}/delete", new { confirmation = "x" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Project not found.\"");
    }

    [Fact]
    public async Task Delete_NotArchived_Returns409()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, status: ProjectStatus.Active);

        var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/delete", new { confirmation = project.Name });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_HasChildren_Returns409()
    {
        await using var dbContext = CreateDbContext();
        var parent = await ProjectFactory.CreateProjectAsync(dbContext, status: ProjectStatus.Archived);
        await ProjectFactory.CreateProjectAsync(dbContext, "Child", parentProjectId: parent.Id);

        var response = await Client.PostAsJsonAsync($"/api/projects/{parent.Id}/delete", new { confirmation = parent.Name });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_ConfirmationMismatch_Returns400()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, "Real Name", ProjectStatus.Archived);

        var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/delete", new { confirmation = "Wrong Name" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Delete_ArchivedNoChildrenMatchingConfirmation_Returns204AndRemoves()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, "Delete Me", ProjectStatus.Archived);

        var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/delete", new { confirmation = "Delete Me" });

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await using var verifyContext = CreateDbContext();
        var exists = await verifyContext.Projects.AnyAsync(p => p.Id == project.Id);
        exists.ShouldBeFalse();
    }
}
