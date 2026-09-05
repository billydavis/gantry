using Gantry.Api.Data;

namespace Gantry.Api.Features.Wins.Delete;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db)
    {
        var win = await db.Wins.FindAsync(id);
        if (win is null || win.DeletedUtc is not null) return Results.NotFound("Win not found.");

        win.DeletedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
