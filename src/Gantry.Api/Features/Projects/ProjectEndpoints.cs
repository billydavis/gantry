namespace Gantry.Api.Features.Projects;

public static class ProjectEndpoints
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        Create.Endpoint.Map(app);
        List.Endpoint.Map(app);
        GetById.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        Archive.Endpoint.Map(app);
        Reactivate.Endpoint.Map(app);
        Hold.Endpoint.Map(app);
        return app;
    }
}
