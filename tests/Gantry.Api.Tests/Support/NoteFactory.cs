using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers shared across Notes tests.</summary>
public static class NoteFactory
{
    public static async Task<Note> CreateNoteAsync(
        AppDbContext db,
        string? title = "Test Note",
        string content = "Some content",
        Guid? projectId = null,
        DateOnly? date = null,
        DateTime? deletedUtc = null)
    {
        var note = new Note
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = title,
            Content = content,
            Date = date,
            DeletedUtc = deletedUtc,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Notes.Add(note);
        await db.SaveChangesAsync();
        return note;
    }
}
