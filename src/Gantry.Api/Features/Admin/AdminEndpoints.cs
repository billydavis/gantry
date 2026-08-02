namespace Gantry.Api.Features.Admin;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/flush-database", FlushDatabase.Endpoint.Handle);

        app.MapPost("/api/admin/backups", Backups.Create.Endpoint.Handle);
        app.MapGet("/api/admin/backups", Backups.List.Endpoint.Handle);
        app.MapGet("/api/admin/backups/{id:guid}/download", Backups.Download.Endpoint.Handle);
        app.MapPost("/api/admin/backups/upload", Backups.Upload.Endpoint.Handle).DisableAntiforgery();
        app.MapPost("/api/admin/backups/{id:guid}/restore", Backups.Restore.Endpoint.Handle);
        app.MapDelete("/api/admin/backups/{id:guid}", Backups.Delete.Endpoint.Handle);

        return app;
    }
}
