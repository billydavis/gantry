using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers shared across Wins tests.</summary>
public static class WinFactory
{
    public static async Task<Win> CreateWinAsync(
        AppDbContext db,
        string title = "Test Win",
        Guid? projectId = null,
        DateOnly? date = null,
        DateTime? deletedUtc = null)
    {
        var win = new Win
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = title,
            Date = date ?? DateOnly.FromDateTime(DateTime.UtcNow),
            DeletedUtc = deletedUtc,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Wins.Add(win);
        await db.SaveChangesAsync();
        return win;
    }
}
