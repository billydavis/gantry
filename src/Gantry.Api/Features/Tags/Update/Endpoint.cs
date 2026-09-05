using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags.Update;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, Request req, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(req, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var tag = await db.Tags.FindAsync([id], ct);
        if (tag is null) return Results.NotFound("Tag not found.");

        var newName = req.Name.Trim();
        var collision = await db.Tags.AnyAsync(t => t.Id != id && t.Name.ToLower() == newName.ToLower(), ct);
        if (collision) return Results.Conflict(new { title = "A tag with that name already exists." });

        tag.Name = newName;
        tag.Color = req.Color;
        await db.SaveChangesAsync(ct);

        var usageCount = await TagUsageQueries.GetCountAsync(db, id, ct);
        return Results.Ok(TagResponse.FromEntity(tag, usageCount));
    }
}
