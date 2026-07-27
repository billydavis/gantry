using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Tags.List;

public static class Endpoint
{
    public static async Task<IResult> Handle(AppDbContext db, CancellationToken ct)
    {
        var tags = await db.Tags.OrderBy(t => t.Name).ToListAsync(ct);
        return Results.Ok(tags.Select(TagResponse.FromEntity));
    }
}
