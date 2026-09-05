using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Notes;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.Update;

[Trait("Category", "Integration")]
public class UpdateNoteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/notes/{Guid.NewGuid()}", new { content = "x" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Note not found.\"");
    }

    [Fact]
    public async Task Update_ExistingNote_UpdatesFields()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/notes/{note.Id}", new { title = "New title", content = "New content" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse>();
        body!.Title.ShouldBe("New title");
        body.Content.ShouldBe("New content");
    }

    [Fact]
    public async Task Update_ContentTooLong_Returns400WithFieldError()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/notes/{note.Id}", new { content = new string('x', 200001) });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Content");
    }
}
