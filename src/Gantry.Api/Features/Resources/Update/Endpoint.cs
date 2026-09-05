using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Resources.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/resources/{id:guid}", Handle).WithName("UpdateResource");

    internal static async Task<IResult> Handle(Guid id, Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var resource = await db.Resources.FindAsync([id], ct);
        if (resource is null)
            return Results.NotFound("Resource not found.");

        if (!Enum.TryParse<ResourceType>(request.Type, out var resourceType))
            return Results.BadRequest("Invalid resource type.");

        if (request.EnvironmentId.HasValue)
        {
            var envExists = await db.Environments.AnyAsync(e => e.Id == request.EnvironmentId, ct);
            if (!envExists)
                return Results.NotFound("Environment not found.");
        }

        resource.Name = request.Name;
        resource.Location = request.Location;
        resource.Type = resourceType;
        resource.Description = request.Description;
        resource.SortOrder = request.SortOrder;
        resource.EnvironmentId = request.EnvironmentId;
        resource.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(ResourceResponse.FromEntity(resource));
    }
}
