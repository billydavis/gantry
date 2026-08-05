using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Articles.GetById;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/articles/{id:guid}", Handle).WithName("GetArticleById");

    private static async Task<IResult> Handle(AppDbContext db, Guid id, CancellationToken ct)
    {
        var article = await db.Articles
            .Include(a => a.Tags)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

        return article is null ? Results.NotFound() : Results.Ok(ArticleResponse.FromEntity(article));
    }
}
