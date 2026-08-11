using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Projects.Delete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/projects/{id:guid}/delete", Handle).WithName("DeleteProject");

    private static async Task<IResult> Handle(Guid id, Request req, AppDbContext db, CancellationToken ct)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (project is null)
            return Results.NotFound();

        if (project.Status != ProjectStatus.Archived)
            return Results.Conflict(new { title = "Only archived projects can be permanently deleted." });

        var hasChildren = await db.Projects.AnyAsync(p => p.ParentProjectId == id, ct);
        if (hasChildren)
            return Results.Conflict(new { title = "This project has sub-projects. Delete or reparent them first." });

        if (req.Confirmation != project.Name)
            return Results.BadRequest(new { title = "Confirmation text does not match the project name." });

        db.Projects.Remove(project);
        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }
}
