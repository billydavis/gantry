using Gantry.Api.Data;

namespace Gantry.Api.Features.Environments.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/environments/{id:guid}", Handle).WithName("UpdateEnvironment");

    private static async Task<IResult> Handle(Guid id, Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var env = await db.Environments.FindAsync([id], ct);
        if (env is null)
            return Results.NotFound();

        env.Name = request.Name;
        env.BaseUrl = request.BaseUrl;
        env.SortOrder = request.SortOrder;
        env.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(EnvironmentResponse.FromEntity(env));
    }
}
