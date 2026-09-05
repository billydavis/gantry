using Gantry.Api.Data;

namespace Gantry.Api.Features.Tags.Delete;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db)
    {
        var tag = await db.Tags.FindAsync(id);
        if (tag is null) return Results.NotFound("Tag not found.");
        db.Tags.Remove(tag);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
