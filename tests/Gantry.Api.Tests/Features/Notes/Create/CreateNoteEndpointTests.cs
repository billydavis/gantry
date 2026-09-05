using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Notes;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.Create;

[Trait("Category", "Integration")]
public class CreateNoteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_WithValidRequest_Returns201AndPersists()
    {
        var response = await Client.PostAsJsonAsync("/api/notes", new { title = "My note", content = "Body text" });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse>();
        body!.Title.ShouldBe("My note");
        body.Content.ShouldBe("Body text");
    }

    [Fact]
    public async Task Create_NoTitleOrContent_DefaultsContentToEmptyString()
    {
        var response = await Client.PostAsJsonAsync("/api/notes", new { });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse>();
        body!.Title.ShouldBeNull();
        body.Content.ShouldBe(string.Empty);
    }

    [Fact]
    public async Task Create_WithProjectId_LoadsProjectName()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext, "Gantry");

        var response = await Client.PostAsJsonAsync("/api/notes", new { projectId = project.Id, content = "x" });

        var body = await response.Content.ReadFromJsonAsync<NoteResponse>();
        body!.ProjectId.ShouldBe(project.Id);
        body.ProjectName.ShouldBe("Gantry");
    }

    [Fact]
    public async Task Create_TitleTooLong_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/notes", new { title = new string('x', 501), content = "x" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Title");
    }
}
