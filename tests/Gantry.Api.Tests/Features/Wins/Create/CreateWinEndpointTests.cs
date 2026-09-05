using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Wins;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.Create;

[Trait("Category", "Integration")]
public class CreateWinEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_WithValidRequest_Returns201AndPersists()
    {
        var response = await Client.PostAsJsonAsync("/api/wins", new
        {
            title = "Shipped the thing",
            impact = "Saved 3 hours a week",
            date = "2026-01-15"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<WinResponse>();
        body!.Title.ShouldBe("Shipped the thing");
        body.Impact.ShouldBe("Saved 3 hours a week");
    }

    [Fact]
    public async Task Create_WithProjectId_LoadsProjectName()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext, "Gantry");

        var response = await Client.PostAsJsonAsync("/api/wins", new
        {
            projectId = project.Id,
            title = "Win",
            date = "2026-01-15"
        });

        var body = await response.Content.ReadFromJsonAsync<WinResponse>();
        body!.ProjectId.ShouldBe(project.Id);
        body.ProjectName.ShouldBe("Gantry");
    }

    [Fact]
    public async Task Create_MissingTitle_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/wins", new { title = "", date = "2026-01-15" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Title");
    }
}
