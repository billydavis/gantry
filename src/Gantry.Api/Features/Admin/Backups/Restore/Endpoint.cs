using Gantry.Api.Data;
using Gantry.Api.Infrastructure.Maintenance;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Gantry.Api.Features.Admin.Backups.Restore;

public static class Endpoint
{
    public static async Task<IResult> Handle(
        Guid id,
        Request req,
        BackupStore store,
        IConfiguration configuration,
        MaintenanceModeState maintenance,
        IServiceScopeFactory scopeFactory,
        CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(req, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var metadata = await store.TryGetAsync(id);
        if (metadata is null)
            return Results.NotFound();

        var path = store.GetDumpPath(metadata);
        if (!File.Exists(path))
            return Results.NotFound();

        if (maintenance.IsActive)
            return Results.Conflict(new { title = "A restore is already in progress." });

        maintenance.Begin("Restoring database…");
        try
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")!;
            var connectionInfo = new NpgsqlConnectionStringBuilder(connectionString);

            await using (var conn = new NpgsqlConnection(connectionString))
            {
                await conn.OpenAsync(ct);
                await using var cmd = new NpgsqlCommand(
                    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = @db AND pid <> pg_backend_pid()",
                    conn);
                cmd.Parameters.AddWithValue("db", connectionInfo.Database!);
                await cmd.ExecuteNonQueryAsync(ct);
            }
            NpgsqlConnection.ClearAllPools();

            var runner = new BackupProcessRunner(configuration);
            var result = await runner.RestoreAsync(path, ct);
            if (!result.Success)
            {
                return Results.Problem(
                    title: "Restore failed",
                    detail: result.StdErr + "\nThe database may be left in an inconsistent state. Consider restoring another backup.",
                    statusCode: StatusCodes.Status500InternalServerError);
            }

            NpgsqlConnection.ClearAllPools();

            await using var scope = scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.MigrateAsync(ct);
            var currentMigrationVersion = (await db.Database.GetAppliedMigrationsAsync(ct)).LastOrDefault();

            return Results.Ok(new Response(metadata.MigrationVersion, currentMigrationVersion));
        }
        finally
        {
            maintenance.End();
        }
    }
}
