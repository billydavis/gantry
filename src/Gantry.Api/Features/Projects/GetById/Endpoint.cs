using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Projects.GetById;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/projects/{id:guid}", Handle).WithName("GetProjectById");

    internal static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var project = await db.Projects
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
        return project is null
            ? Results.NotFound()
            : Results.Ok(ProjectResponse.FromEntity(project));
    }
}
