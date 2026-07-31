using Gantry.Api.Data;
using Entities = Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.AppSettings.Get;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/settings", Handle).WithName("GetAppSettings");

    private static async Task<IResult> Handle(AppDbContext db, CancellationToken ct)
    {
        var settings = await db.AppSettings.FirstOrDefaultAsync(ct);

        if (settings is null)
        {
            settings = new Entities.AppSettings
            {
                Id = Guid.NewGuid(),
                DisplayName = null,
                UpdatedUtc = DateTime.UtcNow,
            };
            db.AppSettings.Add(settings);
            await db.SaveChangesAsync(ct);
        }

        return Results.Ok(AppSettingsResponse.FromEntity(settings));
    }
}
