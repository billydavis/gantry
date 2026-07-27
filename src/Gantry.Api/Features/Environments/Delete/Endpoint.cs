using Gantry.Api.Data;

namespace Gantry.Api.Features.Environments.Delete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/api/environments/{id:guid}", Handle).WithName("DeleteEnvironment");

    private static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var env = await db.Environments.FindAsync([id], ct);
        if (env is null)
            return Results.NotFound();

        db.Environments.Remove(env);
        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }
}
