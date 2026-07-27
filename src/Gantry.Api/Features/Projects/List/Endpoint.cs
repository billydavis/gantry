using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Projects.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/projects", Handle).WithName("ListProjects");

    private static async Task<IResult> Handle(AppDbContext db, CancellationToken ct)
    {
        var projects = await db.Projects
            .Include(p => p.Tags)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);

        return Results.Ok(projects.Select(ProjectResponse.FromEntity));
    }
}
