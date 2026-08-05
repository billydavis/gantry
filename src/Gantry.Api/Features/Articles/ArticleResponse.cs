using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Tags;

namespace Gantry.Api.Features.Articles;

public record ArticleResponse(
    Guid Id,
    string Title,
    string Content,
    string? Category,
    string? SourceUrl,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    TagResponse[] Tags)
{
    public static ArticleResponse FromEntity(Article a) => new(
        a.Id, a.Title, a.Content, a.Category, a.SourceUrl, a.CreatedUtc, a.UpdatedUtc,
        a.Tags.Select(TagResponse.FromEntity).ToArray());
}
