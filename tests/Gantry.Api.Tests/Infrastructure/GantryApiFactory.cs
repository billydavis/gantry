using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Gantry.Api.Tests.Infrastructure;

/// <summary>
/// Boots the real Minimal API in-memory against the shared Testcontainers Postgres instance.
/// Program.cs already reads its connection string from configuration, so overriding config here
/// is enough — no need to replace the AppDbContext service registration.
/// </summary>
public class GantryApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connectionString,
                // Requests/migrations/EF command logging are Information-level by default and get
                // very noisy across a whole test run; keep only warnings and above.
                ["Logging:LogLevel:Default"] = "Warning",
                ["Logging:LogLevel:Microsoft.AspNetCore"] = "Warning",
                ["Logging:LogLevel:Microsoft.EntityFrameworkCore"] = "Warning",
                // McpBearerTokenMiddleware warns once at startup that McpServer:BearerToken is
                // unset — expected here since these tests call MCP tool methods directly rather
                // than through the /mcp route, so the warning isn't actionable in a test run.
                ["Logging:LogLevel:Mcp"] = "Error"
            });
        });
    }
}
