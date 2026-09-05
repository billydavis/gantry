using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Notes;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_FiltersByProjectId()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        await NoteFactory.CreateNoteAsync(dbContext, title: "In project", projectId: project.Id);
        await NoteFactory.CreateNoteAsync(dbContext, title: "No project");

        var response = await Client.GetAsync($"/api/notes?projectId={project.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse[]>();
        body!.ShouldContain(n => n.Title == "In project");
        body!.ShouldNotContain(n => n.Title == "No project");
    }

    [Fact]
    public async Task List_SearchQuery_MatchesTitleOrContent()
    {
        await using var dbContext = CreateDbContext();
        await NoteFactory.CreateNoteAsync(dbContext, title: "Unique keyword here", content: "irrelevant");
        await NoteFactory.CreateNoteAsync(dbContext, title: "Something else", content: "irrelevant");

        var response = await Client.GetAsync("/api/notes?q=keyword");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse[]>();
        body!.ShouldContain(n => n.Title == "Unique keyword here");
        body!.ShouldNotContain(n => n.Title == "Something else");
    }

    [Fact]
    public async Task List_ExcludesSoftDeleted()
    {
        await using var dbContext = CreateDbContext();
        await NoteFactory.CreateNoteAsync(dbContext, title: "Deleted", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/notes");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse[]>();
        body!.ShouldNotContain(n => n.Title == "Deleted");
    }

    [Fact]
    public async Task List_ShortQuery_IsIgnored()
    {
        await using var dbContext = CreateDbContext();
        await NoteFactory.CreateNoteAsync(dbContext, title: "Anything");

        var response = await Client.GetAsync("/api/notes?q=a");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse[]>();
        body!.ShouldContain(n => n.Title == "Anything");
    }
}
