using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Articles.Delete;

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapDelete("/api/articles/{id:guid}", Handle).WithName("DeleteArticle");

    private static async Task<IResult> Handle(AppDbContext db, Guid id, CancellationToken ct)
    {
        var article = await db.Articles.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null || article.DeletedUtc is not null) return Results.NotFound("Article not found.");

        article.DeletedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }
}
