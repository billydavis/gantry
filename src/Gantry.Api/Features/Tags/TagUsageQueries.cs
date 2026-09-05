using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags;

public static class TagUsageQueries
{
    private record CountRow(Guid TagId, int Count);

    public static async Task<Dictionary<Guid, int>> GetAllCountsAsync(AppDbContext db, CancellationToken ct)
    {
        var rows = await db.Database.SqlQuery<CountRow>($"""
            SELECT "TagId", COUNT(*)::int AS "Count" FROM (
                SELECT "TagId" FROM "ProjectTags"
                UNION ALL SELECT "TagId" FROM "TodoTags"
                UNION ALL SELECT "TagId" FROM "NoteTags"
                UNION ALL SELECT "TagId" FROM "ResourceTags"
                UNION ALL SELECT "TagId" FROM "WinTags"
                UNION ALL SELECT "TagId" FROM "ArticleTags"
            ) x GROUP BY "TagId"
            """).ToListAsync(ct);
        return rows.ToDictionary(r => r.TagId, r => r.Count);
    }

    public static async Task<int> GetCountAsync(AppDbContext db, Guid tagId, CancellationToken ct)
    {
        var counts = await GetAllCountsAsync(db, ct);
        return counts.GetValueOrDefault(tagId);
    }
}
