using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.AppSettings.VerifyPin;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/settings/pin/verify", Handle).WithName("VerifyAppSettingsPin");

    private static async Task<IResult> Handle(Request request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var settings = await db.AppSettings.FirstOrDefaultAsync(ct);
        if (settings?.PinHash is null || settings.PinSalt is null)
            return Results.NoContent();

        if (!PinHasher.Verify(request.Pin, settings.PinHash, settings.PinSalt))
            return Results.Unauthorized();

        return Results.NoContent();
    }
}
