namespace Gantry.Api.Features.Quotes;

public static class QuoteEndpoints
{
    public static IEndpointRouteBuilder MapQuoteEndpoints(this IEndpointRouteBuilder app)
    {
        GetToday.Endpoint.Map(app);
        return app;
    }
}
