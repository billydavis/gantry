using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Admin.Backups.Create;

public static class Endpoint
{
    public static async Task<IResult> Handle(
        AppDbContext db, BackupStore store, IConfiguration configuration, CancellationToken ct)
    {
        store.EnsureDirectoryExists();

        var id = Guid.NewGuid();
        var fileName = $"{DateTime.UtcNow:yyyyMMdd-HHmmss}.dump";
        var path = Path.Combine(store.Directory, fileName);

        var runner = new BackupProcessRunner(configuration);
        var result = await runner.DumpAsync(path, ct);
        if (!result.Success)
        {
            if (File.Exists(path))
                File.Delete(path);
            return Results.Problem(title: "Backup failed", detail: result.StdErr, statusCode: StatusCodes.Status500InternalServerError);
        }

        var migrationVersion = (await db.Database.GetAppliedMigrationsAsync(ct)).LastOrDefault();
        var sizeBytes = new FileInfo(path).Length;

        var metadata = new BackupMetadata(id, fileName, null, sizeBytes, migrationVersion, "created", DateTime.UtcNow);
        await store.SaveAsync(metadata);

        return Results.Created($"/api/admin/backups/{id}", metadata);
    }
}
