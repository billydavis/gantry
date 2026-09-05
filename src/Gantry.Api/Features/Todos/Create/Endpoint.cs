using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Todos.Create;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/todos", Handle).WithName("CreateTodo");

    internal static async Task<IResult> Handle(Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var todo = new Todo
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description,
            Link = request.Link,
            Status = TodoStatus.Todo,
            Priority = Enum.TryParse<Priority>(request.Priority, true, out var p) ? p : Priority.Medium,
            EstimatedMinutes = request.EstimatedMinutes,
            DueDate = request.DueDate,
            RecurrenceType = Enum.TryParse<RecurrenceType>(request.RecurrenceType, true, out var r) ? r : RecurrenceType.None,
            RecurrenceIntervalDays = request.RecurrenceIntervalDays,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };

        db.Todos.Add(todo);
        await db.SaveChangesAsync(ct);

        await db.Entry(todo).Reference(t => t.Project).LoadAsync(ct);

        return Results.Created($"/api/todos/{todo.Id}", TodoResponse.FromEntity(todo));
    }
}
