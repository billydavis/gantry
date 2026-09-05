using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers for Tags tests.</summary>
public static class TagFactory
{
    public static async Task<Tag> CreateTagAsync(AppDbContext db, string name = "Test Tag", string? color = null)
    {
        var tag = new Tag { Id = Guid.NewGuid(), Name = name, Color = color };
        db.Tags.Add(tag);
        await db.SaveChangesAsync();
        return tag;
    }
}
