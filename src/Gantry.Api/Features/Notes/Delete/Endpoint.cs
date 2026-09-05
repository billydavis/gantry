using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Notes.Delete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/api/notes/{id:guid}", Handle).WithName("DeleteNote");

    private static async Task<IResult> Handle(AppDbContext db, Guid id, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (note is null || note.DeletedUtc is not null) return Results.NotFound("Note not found.");

        note.DeletedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }
}
