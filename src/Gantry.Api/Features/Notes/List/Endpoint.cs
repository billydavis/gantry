using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Notes.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/notes", Handle).WithName("ListNotes");

    internal static async Task<IResult> Handle(
        AppDbContext db,
        CancellationToken ct,
        Guid? projectId = null,
        int? limit = null)
    {
        var query = db.Notes
            .Include(n => n.Project)
            .Include(n => n.Tags)
            .AsQueryable();

        if (projectId.HasValue)
            query = query.Where(n => n.ProjectId == projectId);

        query = query.OrderByDescending(n => n.UpdatedUtc);

        if (limit.HasValue)
            query = query.Take(limit.Value);

        var notes = await query.ToListAsync(ct);
        return Results.Ok(notes.Select(NoteResponse.FromEntity));
    }
}
