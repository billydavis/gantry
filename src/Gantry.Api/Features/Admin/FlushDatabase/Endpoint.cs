using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Admin.FlushDatabase;

public static class Endpoint
{
    public static async Task<IResult> Handle(Request req, AppDbContext db)
    {
        var validation = await new Validator().ValidateAsync(req);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        await using var transaction = await db.Database.BeginTransactionAsync();

        // Clear the self-referencing ParentProjectId (Restrict) before deleting Projects.
        await db.Database.ExecuteSqlRawAsync("""UPDATE "Projects" SET "ParentProjectId" = NULL""");
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Todos" """);
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Resources" """);
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Notes" """);
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Wins" """);
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Environments" """);
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Projects" """);
        await db.Database.ExecuteSqlRawAsync("""DELETE FROM "Tags" """);

        await transaction.CommitAsync();

        return Results.NoContent();
    }
}
