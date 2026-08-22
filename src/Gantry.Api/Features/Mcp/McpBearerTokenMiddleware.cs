using System.Security.Cryptography;
using System.Text;

namespace Gantry.Api.Features.Mcp;

/// <summary>
/// Gates the /mcp route with a shared-secret bearer token. Unlike the rest of Gantry (no auth,
/// trusted local deployment), MCP is a new LLM-facing surface, so it gets its own check here
/// rather than adding ASP.NET Core auth middleware to the whole app.
/// </summary>
public static class McpBearerTokenMiddleware
{
    public static IApplicationBuilder UseMcpBearerAuth(this IApplicationBuilder app)
    {
        var configuredToken = app.ApplicationServices
            .GetRequiredService<IConfiguration>()["McpServer:BearerToken"];

        if (string.IsNullOrEmpty(configuredToken))
        {
            app.ApplicationServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger("Mcp")
                .LogWarning("McpServer:BearerToken is not configured — all requests to /mcp will be rejected.");
        }

        return app.Use(async (context, next) =>
        {
            if (!context.Request.Path.StartsWithSegments("/mcp"))
            {
                await next();
                return;
            }

            var expected = Encoding.UTF8.GetBytes($"Bearer {configuredToken}");
            var provided = Encoding.UTF8.GetBytes(context.Request.Headers.Authorization.ToString());

            if (string.IsNullOrEmpty(configuredToken) ||
                provided.Length != expected.Length ||
                !CryptographicOperations.FixedTimeEquals(provided, expected))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { title = "Unauthorized" });
                return;
            }

            await next();
        });
    }
}
