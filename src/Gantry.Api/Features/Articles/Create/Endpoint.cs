using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Articles.Create;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/articles", Handle).WithName("CreateArticle");

    internal static async Task<IResult> Handle(CreateArticleRequest request, AppDbContext db, CancellationToken ct)
    {
        var validation = await new Validator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var now = DateTime.UtcNow;
        var article = new Article
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content ?? string.Empty,
            Category = request.Category,
            SourceUrl = request.SourceUrl,
            CreatedUtc = now,
            UpdatedUtc = now,
        };

        db.Articles.Add(article);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/articles/{article.Id}", ArticleResponse.FromEntity(article));
    }
}
