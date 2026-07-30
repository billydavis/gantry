namespace Gantry.Api.Features.SampleData;

public static class SampleDataEndpoints
{
    public static IEndpointRouteBuilder MapSampleDataEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/sample-data/load", Load.Endpoint.Handle);
        return app;
    }
}
