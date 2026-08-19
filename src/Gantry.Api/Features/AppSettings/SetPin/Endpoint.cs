using Gantry.Api.Data;
using Entities = Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.AppSettings.SetPin;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/settings/pin", Handle).WithName("SetAppSettingsPin");

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

        if (settings.PinHash is not null)
            return Results.Problem("A PIN is already set. Use change-pin to update it.", statusCode: StatusCodes.Status400BadRequest);

        var (hash, salt) = PinHasher.Hash(request.Pin);
        settings.PinHash = hash;
        settings.PinSalt = salt;
        settings.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(AppSettingsResponse.FromEntity(settings));
    }
}
