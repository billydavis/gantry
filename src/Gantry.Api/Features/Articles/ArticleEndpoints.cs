namespace Gantry.Api.Features.Articles;

public static class ArticleEndpoints
{
    public static IEndpointRouteBuilder MapArticleEndpoints(this IEndpointRouteBuilder app)
    {
        List.Endpoint.Map(app);
        GetById.Endpoint.Map(app);
        Create.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        Delete.Endpoint.Map(app);
        return app;
    }
}
