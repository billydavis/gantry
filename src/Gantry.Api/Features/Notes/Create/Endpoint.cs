using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Notes.Create;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/notes", Handle).WithName("CreateNote");

    private static async Task<IResult> Handle(CreateNoteRequest request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var now = DateTime.UtcNow;
        var note = new Note
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Title = request.Title,
            Content = request.Content ?? string.Empty,
            CreatedUtc = now,
            UpdatedUtc = now,
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/notes/{note.Id}", NoteResponse.FromEntity(note));
    }
}
