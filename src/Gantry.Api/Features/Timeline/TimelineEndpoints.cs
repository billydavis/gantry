using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Timeline;

public record TimelineItem(
    string Type,        // "Win" | "Todo"
    Guid Id,
    string Title,
    DateOnly Date,
    Guid? ProjectId,
    string? ProjectName,
    string? Impact      // Win only
);

public static class TimelineEndpoints
{
    public static IEndpointRouteBuilder MapTimelineEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/timeline", Handle);
        return app;
    }

    internal static async Task<IResult> Handle(AppDbContext db, int year, int month)
    {
        var start = new DateOnly(year, month, 1);
        var end = start.AddMonths(1).AddDays(-1);

        var wins = await db.Wins
            .Include(w => w.Project)
            .Where(w => w.DeletedUtc == null && w.Date >= start && w.Date <= end)
            .OrderByDescending(w => w.Date)
            .Select(w => new TimelineItem("Win", w.Id, w.Title, w.Date, w.ProjectId, w.Project == null ? null : w.Project.Name, w.Impact))
            .ToListAsync();

        var todos = await db.Todos
            .Include(t => t.Project)
            .Where(t =>
                t.Status == TodoStatus.Complete &&
                t.DeletedUtc == null &&
                t.CompletedUtc != null &&
                DateOnly.FromDateTime(t.CompletedUtc.Value) >= start &&
                DateOnly.FromDateTime(t.CompletedUtc.Value) <= end)
            .OrderByDescending(t => t.CompletedUtc)
            .Select(t => new TimelineItem("Todo", t.Id, t.Title, DateOnly.FromDateTime(t.CompletedUtc!.Value), t.ProjectId, t.Project == null ? null : t.Project.Name, null))
            .ToListAsync();

        var items = wins.Concat(todos)
            .OrderByDescending(i => i.Date)
            .ThenBy(i => i.Type)
            .ToList();

        return Results.Ok(items);
    }
}
