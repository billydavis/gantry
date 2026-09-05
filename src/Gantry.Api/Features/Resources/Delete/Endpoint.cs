using Gantry.Api.Data;

namespace Gantry.Api.Features.Resources.Delete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/api/resources/{id:guid}", Handle).WithName("DeleteResource");

    private static async Task<IResult> Handle(Guid id, AppDbContext db, CancellationToken ct)
    {
        var resource = await db.Resources.FindAsync([id], ct);
        if (resource is null)
            return Results.NotFound("Resource not found.");

        db.Resources.Remove(resource);
        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }
}
