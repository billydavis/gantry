using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Environments.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/environments", Handle).WithName("ListEnvironments");

    private static async Task<IResult> Handle(
        AppDbContext db,
        CancellationToken ct,
        Guid? projectId = null,
        bool globalOnly = false)
    {
        var query = db.Environments.AsQueryable();

        if (globalOnly)
            query = query.Where(e => e.ProjectId == null);
        else if (projectId.HasValue)
            query = query.Where(e => e.ProjectId == projectId);

        var envs = await query
            .OrderBy(e => e.SortOrder)
            .ThenBy(e => e.Name)
            .ToListAsync(ct);

        return Results.Ok(envs.Select(EnvironmentResponse.FromEntity));
    }
}
