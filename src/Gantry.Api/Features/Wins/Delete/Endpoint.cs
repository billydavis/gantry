using Gantry.Api.Data;

namespace Gantry.Api.Features.Wins.Delete;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db)
    {
        var win = await db.Wins.FindAsync(id);
        if (win is null) return Results.NotFound("Win not found.");

        db.Wins.Remove(win);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
