using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Resources.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/resources", Handle).WithName("ListResources");

    private static async Task<IResult> Handle(
        AppDbContext db,
        CancellationToken ct,
        Guid? projectId = null,
        bool globalOnly = false)
    {
        var query = db.Resources.AsQueryable();

        if (globalOnly)
            query = query.Where(r => r.ProjectId == null);
        else if (projectId.HasValue)
            query = query.Where(r => r.ProjectId == projectId);

        var resources = await query
            .Include(r => r.Environment)
            .Include(r => r.Tags)
            .OrderBy(r => r.SortOrder)
            .ThenBy(r => r.Name)
            .ToListAsync(ct);

        return Results.Ok(resources.Select(ResourceResponse.FromEntity));
    }
}
