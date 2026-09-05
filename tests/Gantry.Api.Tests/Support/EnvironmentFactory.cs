using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers for Environments tests.</summary>
public static class EnvironmentFactory
{
    public static async Task<ProjectEnvironment> CreateEnvironmentAsync(
        AppDbContext db,
        string name = "Test Environment",
        Guid? projectId = null,
        string? baseUrl = null,
        int sortOrder = 0)
    {
        var env = new ProjectEnvironment
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = name,
            BaseUrl = baseUrl,
            SortOrder = sortOrder,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Environments.Add(env);
        await db.SaveChangesAsync();
        return env;
    }
}
