using Gantry.Api.Data;

namespace Gantry.Api.Features.Todos.Pin;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/todos/{id:guid}/pin", Handle).WithName("ToggleTodoPin");

    internal static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var todo = await db.Todos.FindAsync([id], ct);
        if (todo is null || todo.DeletedUtc is not null)
            return Results.NotFound();

        todo.IsPinned = !todo.IsPinned;
        todo.UpdatedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Results.Ok(TodoResponse.FromEntity(todo));
    }
}
