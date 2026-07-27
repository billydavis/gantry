using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Wins.Create;

public static class Endpoint
{
    public static async Task<IResult> Handle(Request req, AppDbContext db)
    {
        var validation = await new Validator().ValidateAsync(req);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var now = DateTime.UtcNow;
        var win = new Win
        {
            Id = Guid.NewGuid(),
            ProjectId = req.ProjectId,
            Title = req.Title.Trim(),
            Description = req.Description?.Trim(),
            Impact = req.Impact?.Trim(),
            Date = req.Date,
            CreatedUtc = now,
            UpdatedUtc = now,
        };

        db.Wins.Add(win);
        await db.SaveChangesAsync();

        await db.Entry(win).Reference(w => w.Project).LoadAsync();
        return Results.Created($"/api/wins/{win.Id}", WinResponse.FromEntity(win));
    }
}
