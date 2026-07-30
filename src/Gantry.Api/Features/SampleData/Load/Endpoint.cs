using Gantry.Api.Data;

namespace Gantry.Api.Features.SampleData.Load;

public static class Endpoint
{
    public static async Task<IResult> Handle(AppDbContext db)
    {
        await SampleDataSeeder.SeedAsync(db);
        return Results.NoContent();
    }
}
