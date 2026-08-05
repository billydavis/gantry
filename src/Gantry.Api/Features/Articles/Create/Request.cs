namespace Gantry.Api.Features.Articles.Create;

public record CreateArticleRequest(string Title, string Content, string? Category, string? SourceUrl);
