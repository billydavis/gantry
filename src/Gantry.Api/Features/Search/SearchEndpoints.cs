using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Search;

public record SearchResult(
    string Type,
    Guid Id,
    string Title,
    string? Subtitle,
    string? Snippet,
    string? ProjectName,
    Guid? ProjectId);

public static class SearchEndpoints
{
    public static IEndpointRouteBuilder MapSearchEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/search", Handle);
        return app;
    }

    private static async Task<IResult> Handle(AppDbContext db, string q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Results.Ok(Array.Empty<SearchResult>());

        var pattern = $"%{q.Trim()}%";
        var results = new List<SearchResult>();

        var projects = await db.Projects
            .Include(p => p.Tags)
            .Where(p => EF.Functions.ILike(p.Name, pattern) ||
                EF.Functions.ILike(p.Description ?? "", pattern) ||
                p.Tags.Any(t => EF.Functions.ILike(t.Name, pattern)))
            .OrderBy(p => p.Name)
            .Take(10)
            .ToListAsync(ct);
        results.AddRange(projects.Select(p => new SearchResult(
            "Project", p.Id, p.Name, p.Status.ToString(),
            p.Description?.Length > 120 ? p.Description[..120] + "…" : p.Description,
            null, null)));

        var todos = await db.Todos
            .Include(t => t.Project)
            .Include(t => t.Tags)
            .Where(t => t.DeletedUtc == null &&
                (EF.Functions.ILike(t.Title, pattern) ||
                EF.Functions.ILike(t.Description ?? "", pattern) ||
                t.Tags.Any(tag => EF.Functions.ILike(tag.Name, pattern))))
            .OrderByDescending(t => t.CreatedUtc)
            .Take(10)
            .ToListAsync(ct);
        results.AddRange(todos.Select(t => new SearchResult(
            "Todo", t.Id, t.Title, t.Status.ToString(),
            t.Description?.Length > 120 ? t.Description[..120] + "…" : t.Description,
            t.Project?.Name, t.ProjectId)));

        var notes = await db.Notes
            .Include(n => n.Project)
            .Include(n => n.Tags)
            .Where(n => !n.IsScratchPad &&
                (EF.Functions.ILike(n.Title ?? "", pattern) ||
                EF.Functions.ILike(n.Content, pattern) ||
                n.Tags.Any(t => EF.Functions.ILike(t.Name, pattern))))
            .OrderByDescending(n => n.UpdatedUtc)
            .Take(10)
            .ToListAsync(ct);
        results.AddRange(notes.Select(n => new SearchResult(
            "Note", n.Id,
            n.Title ?? (n.Date.HasValue ? n.Date.Value.ToString("MMM d, yyyy") : "Untitled"),
            n.Date?.ToString("MMM d, yyyy"),
            Snippet(n.Content, q),
            n.Project?.Name, n.ProjectId)));

        var wins = await db.Wins
            .Include(w => w.Project)
            .Include(w => w.Tags)
            .Where(w => EF.Functions.ILike(w.Title, pattern) ||
                EF.Functions.ILike(w.Impact ?? "", pattern) ||
                EF.Functions.ILike(w.Description ?? "", pattern) ||
                w.Tags.Any(t => EF.Functions.ILike(t.Name, pattern)))
            .OrderByDescending(w => w.Date)
            .Take(10)
            .ToListAsync(ct);
        results.AddRange(wins.Select(w => new SearchResult(
            "Win", w.Id, w.Title, w.Date.ToString("MMM d, yyyy"),
            w.Impact,
            w.Project?.Name, w.ProjectId)));

        var resources = await db.Resources
            .Include(r => r.Project)
            .Include(r => r.Tags)
            .Where(r => EF.Functions.ILike(r.Name, pattern) ||
                EF.Functions.ILike(r.Location, pattern) ||
                EF.Functions.ILike(r.Description ?? "", pattern) ||
                r.Tags.Any(t => EF.Functions.ILike(t.Name, pattern)))
            .OrderBy(r => r.Name)
            .Take(10)
            .ToListAsync(ct);
        results.AddRange(resources.Select(r => new SearchResult(
            "Resource", r.Id, r.Name, r.Type.ToString(),
            r.Location,
            r.Project?.Name, r.ProjectId)));

        return Results.Ok(results);
    }

    private static string? Snippet(string content, string query)
    {
        var idx = content.IndexOf(query, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return content.Length > 120 ? content[..120] + "…" : content;
        var start = Math.Max(0, idx - 40);
        var end = Math.Min(content.Length, idx + query.Length + 80);
        var snippet = content[start..end];
        if (start > 0) snippet = "…" + snippet;
        if (end < content.Length) snippet += "…";
        return snippet;
    }
}
