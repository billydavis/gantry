using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Articles.List;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/articles", Handle).WithName("ListArticles");

    internal static async Task<IResult> Handle(
        AppDbContext db,
        CancellationToken ct,
        string? category = null,
        Guid? tagId = null,
        string? q = null)
    {
        var query = db.Articles
            .Include(a => a.Tags)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(a => a.Category == category);

        if (tagId.HasValue)
            query = query.Where(a => a.Tags.Any(t => t.Id == tagId));

        if (q is not null && q.Trim().Length >= 2)
        {
            var pattern = $"%{q.Trim()}%";
            query = query.Where(a =>
                EF.Functions.ILike(a.Title, pattern) ||
                EF.Functions.ILike(a.Content, pattern) ||
                EF.Functions.ILike(a.Category ?? "", pattern) ||
                a.Tags.Any(t => EF.Functions.ILike(t.Name, pattern)));
        }

        query = query.OrderBy(a => a.Title);

        var articles = await query.ToListAsync(ct);
        return Results.Ok(articles.Select(ArticleResponse.FromEntity));
    }
}
