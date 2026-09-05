using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Notes.GetById;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/notes/{id:guid}", Handle).WithName("GetNoteById");

    internal static async Task<IResult> Handle(AppDbContext db, Guid id, CancellationToken ct)
    {
        var note = await db.Notes
            .Include(n => n.Project)
            .Include(n => n.Tags)
            .FirstOrDefaultAsync(n => n.Id == id, ct);

        return note is null ? Results.NotFound("Note not found.") : Results.Ok(NoteResponse.FromEntity(note));
    }
}
