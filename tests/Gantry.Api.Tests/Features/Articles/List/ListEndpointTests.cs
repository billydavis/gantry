using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Articles;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_FiltersByCategory()
    {
        await using var dbContext = CreateDbContext();
        await ArticleFactory.CreateArticleAsync(dbContext, title: "Docs one", category: "Docs");
        await ArticleFactory.CreateArticleAsync(dbContext, title: "Other", category: "Other");

        var response = await Client.GetAsync("/api/articles?category=Docs");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ArticleResponse[]>();
        body!.ShouldContain(a => a.Title == "Docs one");
        body!.ShouldNotContain(a => a.Title == "Other");
    }

    [Fact]
    public async Task List_ExcludesSoftDeleted()
    {
        await using var dbContext = CreateDbContext();
        await ArticleFactory.CreateArticleAsync(dbContext, title: "Deleted", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/articles");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ArticleResponse[]>();
        body!.ShouldNotContain(a => a.Title == "Deleted");
    }

    [Fact]
    public async Task List_SearchQuery_MatchesTitleOrContent()
    {
        await using var dbContext = CreateDbContext();
        await ArticleFactory.CreateArticleAsync(dbContext, title: "Unique keyword here");
        await ArticleFactory.CreateArticleAsync(dbContext, title: "Something else");

        var response = await Client.GetAsync("/api/articles?q=keyword");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ArticleResponse[]>();
        body!.ShouldContain(a => a.Title == "Unique keyword here");
        body!.ShouldNotContain(a => a.Title == "Something else");
    }
}
