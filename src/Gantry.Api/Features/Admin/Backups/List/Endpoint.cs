using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Admin.Backups.List;

public static class Endpoint
{
    public static async Task<Response> Handle(AppDbContext db, BackupStore store, CancellationToken ct)
    {
        var backups = await store.ListAsync();
        var currentMigrationVersion = (await db.Database.GetAppliedMigrationsAsync(ct)).LastOrDefault();
        return new Response(currentMigrationVersion, backups);
    }
}
