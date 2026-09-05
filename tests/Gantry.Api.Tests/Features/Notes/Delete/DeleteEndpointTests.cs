using System.Net;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_ExistingNote_SoftDeletesIt()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext);

        var response = await Client.DeleteAsync($"/api/notes/{note.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await using var verifyContext = CreateDbContext();
        var persisted = await verifyContext.Notes.FirstAsync(n => n.Id == note.Id);
        persisted.DeletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Delete_AlreadyDeletedNote_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.DeleteAsync($"/api/notes/{note.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.DeleteAsync($"/api/notes/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Note not found.\"");
    }
}
