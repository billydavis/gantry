namespace Gantry.Api.Data.Entities;

public class Resource
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public ResourceType Type { get; set; } = ResourceType.Website;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public Guid? EnvironmentId { get; set; }
    public ProjectEnvironment? Environment { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public ICollection<Tag> Tags { get; set; } = [];
}
