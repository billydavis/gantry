using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Articles;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.Update;

[Trait("Category", "Integration")]
public class UpdateArticleEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/articles/{Guid.NewGuid()}", new { title = "Title", content = "x" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Article not found.\"");
    }

    [Fact]
    public async Task Update_ExistingArticle_UpdatesFields()
    {
        await using var dbContext = CreateDbContext();
        var article = await ArticleFactory.CreateArticleAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/articles/{article.Id}", new
        {
            title = "New title",
            content = "New content"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ArticleResponse>();
        body!.Title.ShouldBe("New title");
        body.Content.ShouldBe("New content");
    }
}
