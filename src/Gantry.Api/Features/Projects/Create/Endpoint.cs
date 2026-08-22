using System.Text.Json;
using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Projects.Create;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/projects", Handle).WithName("CreateProject");

    internal static async Task<IResult> Handle(
        Request request,
        AppDbContext db,
        CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var project = new Project
        {
            Id = Guid.NewGuid(),
            ParentProjectId = request.ParentProjectId,
            Name = request.Name,
            Description = request.Description,
            Status = ProjectStatus.Active,
            Color = request.Color,
            Settings = request.Settings.HasValue
                ? JsonSerializer.Serialize(request.Settings.Value)
                : null,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/projects/{project.Id}", ProjectResponse.FromEntity(project));
    }
}
