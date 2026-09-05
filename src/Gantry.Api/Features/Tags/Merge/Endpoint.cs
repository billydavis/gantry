using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags.Merge;

public static class Endpoint
{
    private static readonly (string Table, string Column)[] JoinTables =
    [
        ("ProjectTags", "ProjectId"),
        ("TodoTags", "TodoId"),
        ("NoteTags", "NoteId"),
        ("ResourceTags", "ResourceId"),
        ("WinTags", "WinId"),
        ("ArticleTags", "ArticleId"),
    ];

    public static async Task<IResult> Handle(Guid sourceId, Guid targetId, AppDbContext db, CancellationToken ct)
    {
        if (sourceId == targetId)
            return Results.BadRequest(new { title = "Cannot merge a tag into itself." });

        var source = await db.Tags.FindAsync([sourceId], ct);
        if (source is null) return Results.NotFound("Source tag not found.");
        var target = await db.Tags.FindAsync([targetId], ct);
        if (target is null) return Results.NotFound("Target tag not found.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        foreach (var (table, column) in JoinTables)
        {
            // Drop source-tag rows for entities that already also carry the target tag, so the
            // repoint below can't produce a duplicate (entity, tag) join row.
            var deleteSql =
                $"DELETE FROM \"{table}\" WHERE \"TagId\" = {{0}} " +
                $"AND \"{column}\" IN (SELECT \"{column}\" FROM \"{table}\" WHERE \"TagId\" = {{1}})";
            await db.Database.ExecuteSqlRawAsync(deleteSql, [sourceId, targetId], ct);

            var updateSql = $"UPDATE \"{table}\" SET \"TagId\" = {{0}} WHERE \"TagId\" = {{1}}";
            await db.Database.ExecuteSqlRawAsync(updateSql, [targetId, sourceId], ct);
        }

        // Deleted via raw SQL (not db.Tags.Remove) so it can't collide with any stale tracked
        // many-to-many state this DbContext holds for the source tag's join rows we just rewrote above.
        await db.Database.ExecuteSqlRawAsync("DELETE FROM \"Tags\" WHERE \"Id\" = {0}", [sourceId], ct);
        await tx.CommitAsync(ct);

        var usageCount = await TagUsageQueries.GetCountAsync(db, targetId, ct);
        return Results.Ok(TagResponse.FromEntity(target, usageCount));
    }
}
