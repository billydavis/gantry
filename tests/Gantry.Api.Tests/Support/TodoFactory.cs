using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>
/// Entity-building helpers shared across Todos tests, to keep test bodies focused on the
/// behavior under test rather than repeating EF Core setup boilerplate.
/// </summary>
public static class TodoFactory
{
    public static async Task<Project> CreateProjectAsync(AppDbContext db, string name = "Test Project")
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return project;
    }

    public static async Task<Todo> CreateTodoAsync(
        AppDbContext db,
        string title = "Test Todo",
        Guid? projectId = null,
        TodoStatus status = TodoStatus.Todo,
        Priority priority = Priority.Medium,
        bool isPinned = false,
        DateTime? deletedUtc = null)
    {
        var todo = new Todo
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = title,
            Status = status,
            Priority = priority,
            IsPinned = isPinned,
            DeletedUtc = deletedUtc,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Todos.Add(todo);
        await db.SaveChangesAsync();
        return todo;
    }
}
