namespace Gantry.Api.Data.Entities;

public class Note
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public string? Title { get; set; }
    public DateOnly? Date { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public DateTime? DeletedUtc { get; set; }
    public ICollection<Tag> Tags { get; set; } = [];
}
