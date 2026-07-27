namespace Gantry.Api.Features.Wins;

public static class WinEndpoints
{
    public static IEndpointRouteBuilder MapWinEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/wins", List.Endpoint.Handle);
        app.MapGet("/api/wins/{id:guid}", GetById.Endpoint.Handle);
        app.MapPost("/api/wins", Create.Endpoint.Handle);
        app.MapPut("/api/wins/{id:guid}", Update.Endpoint.Handle);
        app.MapDelete("/api/wins/{id:guid}", Delete.Endpoint.Handle);
        return app;
    }
}
