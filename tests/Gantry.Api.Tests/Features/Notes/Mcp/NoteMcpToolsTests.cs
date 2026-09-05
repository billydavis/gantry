using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Notes.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateNoteRequest = Gantry.Api.Features.Notes.Create.CreateNoteRequest;
using UpdateNoteRequest = Gantry.Api.Features.Notes.Update.UpdateNoteRequest;

namespace Gantry.Api.Tests.Features.Notes.Mcp;

[Trait("Category", "Integration")]
public class NoteMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateNote_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await NoteMcpTools.CreateNote(
            new CreateNoteRequest(null, "Title", "Content"), dbContext, CancellationToken.None);

        result.Title.ShouldBe("Title");
    }

    [Fact]
    public async Task GetNote_NotFound_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => NoteMcpTools.GetNote(Guid.NewGuid(), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Note not found.");
    }

    [Fact]
    public async Task UpdateNote_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => NoteMcpTools.UpdateNote(
            Guid.NewGuid(), new UpdateNoteRequest(null, "Title", "Content"), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Note not found.");
    }

    [Fact]
    public async Task GetOrCreateDailyNote_InvalidDate_ThrowsMcpToolValidationException()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpToolValidationException>(
            () => NoteMcpTools.GetOrCreateDailyNote("bad-date", dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Date must be in yyyy-MM-dd format.");
    }

    [Fact]
    public async Task ListNotes_ReturnsCreatedNote()
    {
        await using var dbContext = CreateDbContext();
        var note = await NoteFactory.CreateNoteAsync(dbContext, title: "Findable");

        var result = await NoteMcpTools.ListNotes(dbContext, CancellationToken.None);

        result.ShouldContain(n => n.Id == note.Id);
    }
}
