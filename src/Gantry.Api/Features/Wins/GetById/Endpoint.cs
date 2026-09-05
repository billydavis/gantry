using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Wins.GetById;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db)
    {
        var win = await db.Wins.Include(w => w.Project).Include(w => w.Tags).FirstOrDefaultAsync(w => w.Id == id);
        return win is null ? Results.NotFound("Win not found.") : Results.Ok(WinResponse.FromEntity(win));
    }
}
