namespace Gantry.Api.Features.Environments;

public static class EnvironmentEndpoints
{
    public static void MapEnvironmentEndpoints(this IEndpointRouteBuilder app)
    {
        Create.Endpoint.Map(app);
        List.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        Delete.Endpoint.Map(app);
    }
}
