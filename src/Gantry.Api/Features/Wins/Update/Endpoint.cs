using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Wins.Update;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, Request req, AppDbContext db)
    {
        var validation = await new Validator().ValidateAsync(req);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var win = await db.Wins.Include(w => w.Project).Include(w => w.Tags).FirstOrDefaultAsync(w => w.Id == id);
        if (win is null) return Results.NotFound();

        win.Title = req.Title.Trim();
        win.Description = req.Description?.Trim();
        win.Impact = req.Impact?.Trim();
        win.Date = req.Date;
        win.ProjectId = req.ProjectId;
        win.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync();
        await db.Entry(win).Reference(w => w.Project).LoadAsync();
        return Results.Ok(WinResponse.FromEntity(win));
    }
}
