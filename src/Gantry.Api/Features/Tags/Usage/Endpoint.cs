using Gantry.Api.Data;
using Gantry.Api.Features.Search;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags.Usage;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var tagExists = await db.Tags.AnyAsync(t => t.Id == id, ct);
        if (!tagExists) return Results.NotFound("Tag not found.");

        var results = new List<SearchResult>();

        var projects = await db.Projects
            .Where(p => p.Tags.Any(t => t.Id == id))
            .OrderBy(p => p.Name)
            .ToListAsync(ct);
        results.AddRange(projects.Select(p => new SearchResult(
            "Project", p.Id, p.Name, p.Status.ToString(), null, null, null)));

        var todos = await db.Todos
            .Include(t => t.Project)
            .Where(t => t.DeletedUtc == null && t.Tags.Any(tag => tag.Id == id))
            .OrderByDescending(t => t.CreatedUtc)
            .ToListAsync(ct);
        results.AddRange(todos.Select(t => new SearchResult(
            "Todo", t.Id, t.Title, t.Status.ToString(), null, t.Project?.Name, t.ProjectId)));

        var notes = await db.Notes
            .Include(n => n.Project)
            .Where(n => n.DeletedUtc == null && n.Tags.Any(t => t.Id == id))
            .OrderByDescending(n => n.UpdatedUtc)
            .ToListAsync(ct);
        results.AddRange(notes.Select(n => new SearchResult(
            "Note", n.Id,
            n.Title ?? (n.Date.HasValue ? n.Date.Value.ToString("MMM d, yyyy") : "Untitled"),
            n.Date?.ToString("MMM d, yyyy"), null,
            n.Project?.Name, n.ProjectId)));

        var wins = await db.Wins
            .Include(w => w.Project)
            .Where(w => w.DeletedUtc == null && w.Tags.Any(t => t.Id == id))
            .OrderByDescending(w => w.Date)
            .ToListAsync(ct);
        results.AddRange(wins.Select(w => new SearchResult(
            "Win", w.Id, w.Title, w.Date.ToString("MMM d, yyyy"), null,
            w.Project?.Name, w.ProjectId)));

        var resources = await db.Resources
            .Include(r => r.Project)
            .Where(r => r.Tags.Any(t => t.Id == id))
            .OrderBy(r => r.Name)
            .ToListAsync(ct);
        results.AddRange(resources.Select(r => new SearchResult(
            "Resource", r.Id, r.Name, r.Type.ToString(), null,
            r.Project?.Name, r.ProjectId)));

        var articles = await db.Articles
            .Where(a => a.DeletedUtc == null && a.Tags.Any(t => t.Id == id))
            .OrderByDescending(a => a.UpdatedUtc)
            .ToListAsync(ct);
        results.AddRange(articles.Select(a => new SearchResult(
            "Article", a.Id, a.Title, a.Category, null, null, null)));

        return Results.Ok(results);
    }
}
