namespace Gantry.Api.Data.Entities;

public class ProjectEnvironment
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? BaseUrl { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }

    public ICollection<Resource> Resources { get; set; } = [];
}
