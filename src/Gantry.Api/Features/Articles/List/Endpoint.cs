using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Articles.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/articles", Handle).WithName("ListArticles");

    private static async Task<IResult> Handle(
        AppDbContext db,
        CancellationToken ct,
        string? category = null,
        Guid? tagId = null)
    {
        var query = db.Articles
            .Include(a => a.Tags)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(a => a.Category == category);

        if (tagId.HasValue)
            query = query.Where(a => a.Tags.Any(t => t.Id == tagId));

        query = query.OrderBy(a => a.Title);

        var articles = await query.ToListAsync(ct);
        return Results.Ok(articles.Select(ArticleResponse.FromEntity));
    }
}
