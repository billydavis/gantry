namespace Gantry.Api.Data.Entities;

public class Win
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Impact { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public ICollection<Tag> Tags { get; set; } = [];
}
