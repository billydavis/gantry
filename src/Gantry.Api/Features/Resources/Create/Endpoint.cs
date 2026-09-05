using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Resources.Create;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/resources", Handle).WithName("CreateResource");

    internal static async Task<IResult> Handle(Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        if (request.ProjectId.HasValue)
        {
            var projectExists = await db.Projects.AnyAsync(p => p.Id == request.ProjectId, ct);
            if (!projectExists)
                return Results.NotFound("Project not found.");
        }

        if (!Enum.TryParse<ResourceType>(request.Type, out var resourceType))
            return Results.BadRequest("Invalid resource type.");

        if (request.EnvironmentId.HasValue)
        {
            var envExists = await db.Environments.AnyAsync(e => e.Id == request.EnvironmentId, ct);
            if (!envExists)
                return Results.NotFound("Environment not found.");
        }

        var resource = new Resource
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Name = request.Name,
            Location = request.Location,
            Type = resourceType,
            Description = request.Description,
            EnvironmentId = request.EnvironmentId,
            SortOrder = request.SortOrder,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };

        db.Resources.Add(resource);
        await db.SaveChangesAsync(ct);

        await db.Entry(resource).Reference(r => r.Environment).LoadAsync(ct);

        return Results.Created($"/api/resources/{resource.Id}", ResourceResponse.FromEntity(resource));
    }
}
