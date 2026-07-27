using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Notes.GetOrCreateScratchPad;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/notes/scratchpad", Handle).WithName("GetOrCreateScratchPad");

    private static async Task<IResult> Handle(AppDbContext db, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.IsScratchPad, ct);

        if (note is null)
        {
            var now = DateTime.UtcNow;
            note = new Note
            {
                Id = Guid.NewGuid(),
                IsScratchPad = true,
                Content = string.Empty,
                CreatedUtc = now,
                UpdatedUtc = now,
            };
            db.Notes.Add(note);
            await db.SaveChangesAsync(ct);
        }

        return Results.Ok(NoteResponse.FromEntity(note));
    }
}
