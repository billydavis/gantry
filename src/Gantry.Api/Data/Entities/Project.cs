namespace Gantry.Api.Data.Entities;

public class Project
{
    public Guid Id { get; set; }
    public Guid? ParentProjectId { get; set; }
    public Project? ParentProject { get; set; }
    public ICollection<Project> ChildProjects { get; set; } = [];
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public string? Color { get; set; }
    public string? Settings { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public ICollection<Tag> Tags { get; set; } = [];
}
