using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Projects.Hold;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/projects/{id:guid}/hold", Handle).WithName("HoldProject");

    internal static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var all = await db.Projects.ToListAsync(ct);

        var target = all.FirstOrDefault(p => p.Id == id);
        if (target is null)
            return Results.NotFound("Project not found.");

        var toUpdate = Descendants(all, id);
        toUpdate.Add(target);

        var now = DateTime.UtcNow;
        foreach (var project in toUpdate)
        {
            project.Status = ProjectStatus.OnHold;
            project.UpdatedUtc = now;
        }

        await db.SaveChangesAsync(ct);

        return Results.Ok(ProjectResponse.FromEntity(target));
    }

    private static List<Project> Descendants(List<Project> all, Guid parentId)
    {
        var result = new List<Project>();
        foreach (var child in all.Where(p => p.ParentProjectId == parentId))
        {
            result.Add(child);
            result.AddRange(Descendants(all, child.Id));
        }
        return result;
    }
}
