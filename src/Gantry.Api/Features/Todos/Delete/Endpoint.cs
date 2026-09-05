using Gantry.Api.Data;

namespace Gantry.Api.Features.Todos.Delete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/api/todos/{id:guid}", Handle).WithName("DeleteTodo");

    internal static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var todo = await db.Todos.FindAsync([id], ct);
        if (todo is null || todo.DeletedUtc is not null)
            return Results.NotFound("Todo not found.");

        todo.DeletedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }
}
