using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags.Assign;

public record AssignRequest(Guid[] TagIds);

public static class Endpoint
{
    public static async Task<IResult> AssignToProject(Guid id, AssignRequest req, AppDbContext db)
    {
        var entity = await db.Projects.Include(e => e.Tags).FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) return Results.NotFound();
        await ApplyTags(entity.Tags, req.TagIds, db);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> AssignToTodo(Guid id, AssignRequest req, AppDbContext db)
    {
        var entity = await db.Todos.Include(e => e.Tags).FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) return Results.NotFound();
        await ApplyTags(entity.Tags, req.TagIds, db);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> AssignToNote(Guid id, AssignRequest req, AppDbContext db)
    {
        var entity = await db.Notes.Include(e => e.Tags).FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) return Results.NotFound();
        await ApplyTags(entity.Tags, req.TagIds, db);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> AssignToResource(Guid id, AssignRequest req, AppDbContext db)
    {
        var entity = await db.Resources.Include(e => e.Tags).FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) return Results.NotFound();
        await ApplyTags(entity.Tags, req.TagIds, db);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> AssignToWin(Guid id, AssignRequest req, AppDbContext db)
    {
        var entity = await db.Wins.Include(e => e.Tags).FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) return Results.NotFound();
        await ApplyTags(entity.Tags, req.TagIds, db);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private static async Task ApplyTags(ICollection<Data.Entities.Tag> current, Guid[] tagIds, AppDbContext db)
    {
        current.Clear();
        if (tagIds.Length > 0)
        {
            var tags = await db.Tags.Where(t => tagIds.Contains(t.Id)).ToListAsync();
            foreach (var tag in tags) current.Add(tag);
        }
    }
}
