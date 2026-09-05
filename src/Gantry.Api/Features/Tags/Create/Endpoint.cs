using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags.Create;

public static class Endpoint
{
    public static async Task<IResult> Handle(Request req, AppDbContext db)
    {
        var validation = await new Validator().ValidateAsync(req);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var exists = await db.Tags.AnyAsync(t => t.Name.ToLower() == req.Name.ToLower().Trim());
        if (exists) return Results.Conflict(new { title = "A tag with that name already exists." });

        var tag = new Tag { Id = Guid.NewGuid(), Name = req.Name.Trim(), Color = req.Color };
        db.Tags.Add(tag);
        await db.SaveChangesAsync();
        return Results.Created($"/api/tags/{tag.Id}", TagResponse.FromEntity(tag));
    }
}
