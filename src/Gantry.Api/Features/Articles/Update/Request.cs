namespace Gantry.Api.Features.Articles.Update;

public record UpdateArticleRequest(string Title, string Content, string? Category, string? SourceUrl);
