using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Gantry.Api.Tests.Infrastructure;

/// <summary>
/// Base for REST endpoint tests: hits the real Minimal API over HTTP via WebApplicationFactory.
/// Resets DB state before each test (not after) so a failed test's leftover rows are inspectable
/// and the next test still starts clean.
/// </summary>
[Collection("Database")]
public abstract class IntegrationTestBase(DatabaseFixture db) : IAsyncLifetime
{
    protected DatabaseFixture Db { get; } = db;
    protected HttpClient Client => Db.Factory.CreateClient();

    /// <summary>Direct DB access for arranging fixture data the REST call under test depends on.</summary>
    protected AppDbContext CreateDbContext() => new(
        new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(Db.Postgres.ConnectionString).Options);

    public Task InitializeAsync() => Db.ResetAsync();
    public Task DisposeAsync() => Task.CompletedTask;
}
