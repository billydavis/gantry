using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Todos.GetById;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/todos/{id:guid}", Handle).WithName("GetTodoById");

    internal static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var todo = await db.Todos.Include(t => t.Project).Include(t => t.Tags).FirstOrDefaultAsync(t => t.Id == id && t.DeletedUtc == null, ct);
        return todo is null
            ? Results.NotFound("Todo not found.")
            : Results.Ok(TodoResponse.FromEntity(todo));
    }
}
