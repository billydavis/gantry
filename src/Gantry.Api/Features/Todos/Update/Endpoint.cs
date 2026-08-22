using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Todos.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/todos/{id:guid}", Handle).WithName("UpdateTodo");

    internal static async Task<IResult> Handle(Guid id, Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var todo = await db.Todos.Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == id, ct);
        if (todo is null)
            return Results.NotFound();

        todo.ProjectId = request.ProjectId;
        todo.Title = request.Title;
        todo.Description = request.Description;
        todo.Link = request.Link;
        todo.EstimatedMinutes = request.EstimatedMinutes;
        todo.DueDate = request.DueDate;

        if (request.Priority is not null && Enum.TryParse<Priority>(request.Priority, true, out var priority))
            todo.Priority = priority;

        if (request.Status is not null && Enum.TryParse<TodoStatus>(request.Status, true, out var status))
        {
            todo.Status = status;
            if (status == TodoStatus.Complete && todo.CompletedUtc is null)
                todo.CompletedUtc = DateTime.UtcNow;
            else if (status != TodoStatus.Complete)
                todo.CompletedUtc = null;
        }

        todo.UpdatedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await db.Entry(todo).Reference(t => t.Project).LoadAsync(ct);

        return Results.Ok(TodoResponse.FromEntity(todo));
    }
}
