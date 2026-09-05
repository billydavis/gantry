using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Wins.List;

public static class Endpoint
{
    public static async Task<IResult> Handle(AppDbContext db, Guid? projectId = null, int? limit = null)
    {
        var query = db.Wins.Include(w => w.Project).Include(w => w.Tags).Where(w => w.DeletedUtc == null).AsQueryable();

        if (projectId.HasValue)
            query = query.Where(w => w.ProjectId == projectId);

        query = query.OrderByDescending(w => w.Date).ThenByDescending(w => w.CreatedUtc);

        if (limit.HasValue)
            query = query.Take(limit.Value);

        var wins = await query.ToListAsync();
        return Results.Ok(wins.Select(WinResponse.FromEntity));
    }
}
