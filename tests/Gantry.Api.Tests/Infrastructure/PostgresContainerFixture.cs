using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using Xunit;

namespace Gantry.Api.Tests.Infrastructure;

/// <summary>
/// One throwaway Postgres container for the whole test run. EF InMemory/SQLite can't represent
/// this schema's jsonb/timestamptz columns, so integration tests need a real Postgres.
/// </summary>
public class PostgresContainerFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:17-alpine")
        .WithDatabase("gantry_test")
        .WithUsername("gantry")
        .WithPassword("gantry")
        .Build();

    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        await using var db = new AppDbContext(options);
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync() => await _container.DisposeAsync();
}
