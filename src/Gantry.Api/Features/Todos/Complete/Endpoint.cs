using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Todos.Complete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/todos/{id:guid}/complete", Handle).WithName("CompleteTodo");

    internal static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var todo = await db.Todos.Include(t => t.Project).Include(t => t.Tags).FirstOrDefaultAsync(t => t.Id == id, ct);
        if (todo is null)
            return Results.NotFound("Todo not found.");

        var wasComplete = todo.Status == TodoStatus.Complete;

        todo.Status = TodoStatus.Complete;
        todo.CompletedUtc = DateTime.UtcNow;
        todo.UpdatedUtc = DateTime.UtcNow;

        if (!wasComplete)
        {
            var nextOccurrence = RecurrenceCalculator.TrySpawnNextOccurrence(todo);
            if (nextOccurrence is not null)
                db.Todos.Add(nextOccurrence);
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(TodoResponse.FromEntity(todo));
    }
}
