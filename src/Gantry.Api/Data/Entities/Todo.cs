namespace Gantry.Api.Data.Entities;

public class Todo
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TodoStatus Status { get; set; } = TodoStatus.Todo;
    public Priority Priority { get; set; } = Priority.Medium;
    public int? EstimatedMinutes { get; set; }
    public DateOnly? DueDate { get; set; }
    public bool IsPinned { get; set; }
    public DateTime? CompletedUtc { get; set; }
    public DateTime? DeletedUtc { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public ICollection<Tag> Tags { get; set; } = [];
}
