using System.Net;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_ExistingArticle_SoftDeletesIt()
    {
        await using var dbContext = CreateDbContext();
        var article = await ArticleFactory.CreateArticleAsync(dbContext);

        var response = await Client.DeleteAsync($"/api/articles/{article.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await using var verifyContext = CreateDbContext();
        var persisted = await verifyContext.Articles.FirstAsync(a => a.Id == article.Id);
        persisted.DeletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Delete_AlreadyDeletedArticle_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var article = await ArticleFactory.CreateArticleAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.DeleteAsync($"/api/articles/{article.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.DeleteAsync($"/api/articles/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Article not found.\"");
    }
}
