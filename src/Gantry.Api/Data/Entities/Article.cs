namespace Gantry.Api.Data.Entities;

public class Article
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public DateTime? DeletedUtc { get; set; }
    public ICollection<Tag> Tags { get; set; } = [];
}
