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
        Guid? tagId = null,
        string? q = null,
        int? skip = null,
        int? take = null,
        int? limit = null)
    {
        var query = db.Notes
            .Include(n => n.Project)
            .Include(n => n.Tags)
            .AsQueryable();

        if (projectId.HasValue)
            query = query.Where(n => n.ProjectId == projectId);

        if (tagId.HasValue)
            query = query.Where(n => n.Tags.Any(t => t.Id == tagId));

        if (q is not null && q.Trim().Length >= 2)
        {
            var pattern = $"%{q.Trim()}%";
            query = query.Where(n =>
                EF.Functions.ILike(n.Title ?? "", pattern) ||
                EF.Functions.ILike(n.Content, pattern) ||
                n.Tags.Any(t => EF.Functions.ILike(t.Name, pattern)));
        }

        query = query.OrderByDescending(n => n.UpdatedUtc);

        if (skip is > 0)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);
        else if (limit.HasValue)
            query = query.Take(limit.Value);

        var notes = await query.ToListAsync(ct);
        return Results.Ok(notes.Select(NoteResponse.FromEntity));
    }
}
