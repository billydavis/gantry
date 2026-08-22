using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Todos.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/todos", Handle).WithName("ListTodos");

    internal static async Task<IResult> Handle(
        AppDbContext db,
        CancellationToken ct,
        Guid? projectId = null,
        string? status = null,
        bool includeCompleted = false)
    {
        var query = db.Todos
            .Include(t => t.Project)
            .Include(t => t.Tags)
            .Where(t => t.DeletedUtc == null)
            .AsQueryable();

        if (projectId.HasValue)
            query = query.Where(t => t.ProjectId == projectId);

        if (status is not null && Enum.TryParse<TodoStatus>(status, true, out var parsedStatus))
            query = query.Where(t => t.Status == parsedStatus);
        else if (!includeCompleted)
            query = query.Where(t => t.Status != TodoStatus.Complete);

        var todos = await query.ToListAsync(ct);

        var sorted = todos
            .OrderByDescending(t => t.IsPinned)
            .ThenBy(t => t.DueDate.HasValue ? 0 : 1)
            .ThenBy(t => t.DueDate ?? DateOnly.MaxValue)
            .ThenBy(t => t.Priority switch { Priority.High => 0, Priority.Medium => 1, _ => 2 })
            .ThenBy(t => t.CreatedUtc);

        return Results.Ok(sorted.Select(TodoResponse.FromEntity));
    }
}
