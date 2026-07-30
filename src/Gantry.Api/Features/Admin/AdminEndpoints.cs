namespace Gantry.Api.Features.Admin;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/flush-database", FlushDatabase.Endpoint.Handle);
        return app;
    }
}
