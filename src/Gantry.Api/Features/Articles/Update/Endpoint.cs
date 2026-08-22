using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Articles.Update;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/articles/{id:guid}", Handle).WithName("UpdateArticle");

    internal static async Task<IResult> Handle(Guid id, UpdateArticleRequest request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var article = await db.Articles.Include(a => a.Tags).FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null) return Results.NotFound();

        article.Title = request.Title;
        article.Content = request.Content;
        article.Category = request.Category;
        article.SourceUrl = request.SourceUrl;
        article.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Results.Ok(ArticleResponse.FromEntity(article));
    }
}
