namespace Gantry.Api.Features.Todos;

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodoEndpoints(this IEndpointRouteBuilder app)
    {
        Create.Endpoint.Map(app);
        List.Endpoint.Map(app);
        GetById.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        Complete.Endpoint.Map(app);
        Reopen.Endpoint.Map(app);
        Delete.Endpoint.Map(app);
        Pin.Endpoint.Map(app);
        return app;
    }
}
