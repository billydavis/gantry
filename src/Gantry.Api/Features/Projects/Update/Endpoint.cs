using System.Text.Json;
using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Projects.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/projects/{id:guid}", Handle).WithName("UpdateProject");

    private static async Task<IResult> Handle(
        Guid id,
        Request request,
        AppDbContext db,
        CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var project = await db.Projects.FindAsync([id], ct);
        if (project is null)
            return Results.NotFound();

        project.ParentProjectId = request.ParentProjectId;
        project.Name = request.Name;
        project.Description = request.Description;
        project.Color = request.Color;
        project.Settings = request.Settings.HasValue
            ? JsonSerializer.Serialize(request.Settings.Value)
            : null;
        project.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(ProjectResponse.FromEntity(project));
    }
}
