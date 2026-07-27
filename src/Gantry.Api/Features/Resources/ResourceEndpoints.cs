namespace Gantry.Api.Features.Resources;

public static class ResourceEndpoints
{
    public static void MapResourceEndpoints(this IEndpointRouteBuilder app)
    {
        Create.Endpoint.Map(app);
        List.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        Delete.Endpoint.Map(app);
        Reorder.Endpoint.Map(app);
    }
}
