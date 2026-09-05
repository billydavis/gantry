using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Wins;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_FiltersByProjectId()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await WinFactory.CreateWinAsync(dbContext, title: "In project", projectId: project.Id);
        await WinFactory.CreateWinAsync(dbContext, title: "No project");

        var response = await Client.GetAsync($"/api/wins?projectId={project.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<WinResponse[]>();
        body!.ShouldContain(w => w.Title == "In project");
        body!.ShouldNotContain(w => w.Title == "No project");
    }

    [Fact]
    public async Task List_ExcludesSoftDeleted()
    {
        await using var dbContext = CreateDbContext();
        await WinFactory.CreateWinAsync(dbContext, title: "Deleted", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/wins");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<WinResponse[]>();
        body!.ShouldNotContain(w => w.Title == "Deleted");
    }

    [Fact]
    public async Task List_RespectsLimit()
    {
        await using var dbContext = CreateDbContext();
        await WinFactory.CreateWinAsync(dbContext, title: "First");
        await WinFactory.CreateWinAsync(dbContext, title: "Second");

        var response = await Client.GetAsync("/api/wins?limit=1");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<WinResponse[]>();
        body!.Length.ShouldBe(1);
    }
}
