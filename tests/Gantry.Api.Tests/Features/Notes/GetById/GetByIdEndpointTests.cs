using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Notes;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.GetById;

[Trait("Category", "Integration")]
public class GetByIdEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_ExistingNote_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext, title: "Find me");

        var response = await Client.GetAsync($"/api/notes/{note.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse>();
        body!.Title.ShouldBe("Find me");
    }

    [Fact]
    public async Task Get_UnknownId_Returns404WithMessage()
    {
        var response = await Client.GetAsync($"/api/notes/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Note not found.\"");
    }

    [Fact]
    public async Task Get_SoftDeletedNote_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync($"/api/notes/{note.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}
