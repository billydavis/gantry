using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers for Resources tests.</summary>
public static class ResourceFactory
{
    public static async Task<Resource> CreateResourceAsync(
        AppDbContext db,
        string name = "Test Resource",
        string location = "https://example.com",
        ResourceType type = ResourceType.Website,
        Guid? projectId = null,
        Guid? environmentId = null,
        int sortOrder = 0)
    {
        var resource = new Resource
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = name,
            Location = location,
            Type = type,
            EnvironmentId = environmentId,
            SortOrder = sortOrder,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Resources.Add(resource);
        await db.SaveChangesAsync();
        return resource;
    }
}
