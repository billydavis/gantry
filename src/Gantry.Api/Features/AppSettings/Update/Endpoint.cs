using Gantry.Api.Data;
using Entities = Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.AppSettings.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/settings", Handle).WithName("UpdateAppSettings");

    private static async Task<IResult> Handle(Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var settings = await db.AppSettings.FirstOrDefaultAsync(ct);
        if (settings is null)
        {
            settings = new Entities.AppSettings { Id = Guid.NewGuid() };
            db.AppSettings.Add(settings);
        }

        settings.DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName.Trim();
        settings.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        settings.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(AppSettingsResponse.FromEntity(settings));
    }
}
