using Npgsql;
using Respawn;
using Respawn.Graph;
using Xunit;

namespace Gantry.Api.Tests.Infrastructure;

/// <summary>
/// Owns the shared Postgres container and WebApplicationFactory for a whole test run, plus a
/// Respawner that truncates all tables between tests so they don't need a container each.
/// </summary>
public class DatabaseFixture : IAsyncLifetime
{
    public PostgresContainerFixture Postgres { get; } = new();
    public GantryApiFactory Factory { get; private set; } = null!;

    private Respawner _respawner = null!;

    public async Task InitializeAsync()
    {
        await Postgres.InitializeAsync();
        Factory = new GantryApiFactory(Postgres.ConnectionString);

        // Force the host to build (running Program.cs's own Migrate call) before tests start.
        _ = Factory.Server;

        await using var connection = new NpgsqlConnection(Postgres.ConnectionString);
        await connection.OpenAsync();
        _respawner = await Respawner.CreateAsync(connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"],
            TablesToIgnore = [new Table("__EFMigrationsHistory")]
        });
    }

    public async Task ResetAsync()
    {
        await using var connection = new NpgsqlConnection(Postgres.ConnectionString);
        await connection.OpenAsync();
        await _respawner.ResetAsync(connection);
    }

    public async Task DisposeAsync()
    {
        Factory.Dispose();
        await Postgres.DisposeAsync();
    }
}

[CollectionDefinition("Database", DisableParallelization = true)]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture>;
