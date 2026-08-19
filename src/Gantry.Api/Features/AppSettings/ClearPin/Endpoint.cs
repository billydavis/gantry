using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.AppSettings.ClearPin;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/settings/pin/clear", Handle).WithName("ClearAppSettingsPin");

    private static async Task<IResult> Handle(Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var settings = await db.AppSettings.FirstOrDefaultAsync(ct);
        if (settings?.PinHash is null || settings.PinSalt is null)
            return Results.Problem("No PIN is currently set.", statusCode: StatusCodes.Status400BadRequest);

        if (!PinHasher.Verify(request.CurrentPin, settings.PinHash, settings.PinSalt))
            return Results.Unauthorized();

        settings.PinHash = null;
        settings.PinSalt = null;
        settings.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return Results.Ok(AppSettingsResponse.FromEntity(settings));
    }
}
