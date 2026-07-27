using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Notes.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/notes/{id:guid}", Handle).WithName("UpdateNote");

    private static async Task<IResult> Handle(Guid id, UpdateNoteRequest request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (note is null) return Results.NotFound();

        note.Title = request.Title;
        note.Content = request.Content;
        note.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Results.Ok(NoteResponse.FromEntity(note));
    }
}
