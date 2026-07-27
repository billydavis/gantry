using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Environments.Create;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/environments", Handle).WithName("CreateEnvironment");

    private static async Task<IResult> Handle(Request request, AppDbContext db, CancellationToken ct)
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

        var env = new ProjectEnvironment
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Name = request.Name,
            BaseUrl = request.BaseUrl,
            SortOrder = request.SortOrder,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };

        db.Environments.Add(env);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/environments/{env.Id}", EnvironmentResponse.FromEntity(env));
    }
}
