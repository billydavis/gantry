using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Notes.GetOrCreateDaily;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/notes/daily/{date}", Handle).WithName("GetOrCreateDailyNote");

    private static async Task<IResult> Handle(AppDbContext db, string date, CancellationToken ct)
    {
        if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", out var parsedDate))
            return Results.BadRequest("Date must be in yyyy-MM-dd format.");

        var note = await db.Notes
            .FirstOrDefaultAsync(n => n.Date == parsedDate && n.ProjectId == null, ct);

        if (note is null)
        {
            var now = DateTime.UtcNow;
            note = new Note
            {
                Id = Guid.NewGuid(),
                Date = parsedDate,
                Content = DailyTemplate,
                CreatedUtc = now,
                UpdatedUtc = now,
            };
            db.Notes.Add(note);
            await db.SaveChangesAsync(ct);
        }

        return Results.Ok(NoteResponse.FromEntity(note));
    }

    private const string DailyTemplate =
        "## Meetings\n\n\n## Ideas\n\n\n## Things I Learned\n\n\n## Questions\n\n\n## Tomorrow\n\n";
}
