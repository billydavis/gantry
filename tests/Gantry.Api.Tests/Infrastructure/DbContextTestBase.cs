using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Gantry.Api.Tests.Infrastructure;

/// <summary>
/// Base for MCP tool tests: no HTTP/JSON-RPC transport needed since [McpServerTool] methods just
/// take an AppDbContext directly. Shares the same container + Respawn reset as IntegrationTestBase.
/// </summary>
[Collection("Database")]
public abstract class DbContextTestBase(DatabaseFixture db) : IAsyncLifetime
{
    protected DatabaseFixture Db { get; } = db;

    protected AppDbContext CreateDbContext() => new(
        new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(Db.Postgres.ConnectionString).Options);

    public Task InitializeAsync() => Db.ResetAsync();
    public Task DisposeAsync() => Task.CompletedTask;
}
