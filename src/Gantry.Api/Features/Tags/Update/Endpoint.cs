using Gantry.Api.Data;

namespace Gantry.Api.Features.Tags.Update;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, Request req, AppDbContext db)
    {
        var validation = await new Validator().ValidateAsync(req);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var tag = await db.Tags.FindAsync(id);
        if (tag is null) return Results.NotFound("Tag not found.");

        tag.Name = req.Name.Trim();
        tag.Color = req.Color;
        await db.SaveChangesAsync();
        return Results.Ok(TagResponse.FromEntity(tag));
    }
}
