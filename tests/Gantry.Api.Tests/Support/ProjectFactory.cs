using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>
/// Entity-building helpers shared across Projects tests, to keep test bodies focused on the
/// behavior under test rather than repeating EF Core setup boilerplate.
/// </summary>
public static class ProjectFactory
{
    public static async Task<Project> CreateProjectAsync(
        AppDbContext db,
        string name = "Test Project",
        ProjectStatus status = ProjectStatus.Active,
        Guid? parentProjectId = null)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = name,
            Status = status,
            ParentProjectId = parentProjectId,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return project;
    }
}
