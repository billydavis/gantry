using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Articles;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.GetById;

[Trait("Category", "Integration")]
public class GetByIdEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_ExistingArticle_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        var article = await ArticleFactory.CreateArticleAsync(dbContext, title: "Find me");

        var response = await Client.GetAsync($"/api/articles/{article.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ArticleResponse>();
        body!.Title.ShouldBe("Find me");
    }

    [Fact]
    public async Task Get_UnknownId_Returns404WithMessage()
    {
        var response = await Client.GetAsync($"/api/articles/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Article not found.\"");
    }

    [Fact]
    public async Task Get_SoftDeletedArticle_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var article = await ArticleFactory.CreateArticleAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync($"/api/articles/{article.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}
