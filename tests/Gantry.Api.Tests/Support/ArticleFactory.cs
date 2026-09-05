using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers shared across Articles tests.</summary>
public static class ArticleFactory
{
    public static async Task<Article> CreateArticleAsync(
        AppDbContext db,
        string title = "Test Article",
        string content = "Some content",
        string? category = null,
        string? sourceUrl = null,
        DateTime? deletedUtc = null)
    {
        var article = new Article
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = content,
            Category = category,
            SourceUrl = sourceUrl,
            DeletedUtc = deletedUtc,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Articles.Add(article);
        await db.SaveChangesAsync();
        return article;
    }
}
