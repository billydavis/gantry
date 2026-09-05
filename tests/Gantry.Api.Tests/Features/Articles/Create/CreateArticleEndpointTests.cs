using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Articles;
using Gantry.Api.Tests.Infrastructure;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.Create;

[Trait("Category", "Integration")]
public class CreateArticleEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_WithValidRequest_Returns201AndPersists()
    {
        var response = await Client.PostAsJsonAsync("/api/articles", new
        {
            title = "How Gantry works",
            content = "Body text",
            category = "Docs"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ArticleResponse>();
        body!.Title.ShouldBe("How Gantry works");
        body.Category.ShouldBe("Docs");
    }

    [Fact]
    public async Task Create_MissingTitle_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/articles", new { title = "", content = "x" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Title");
    }

    [Fact]
    public async Task Create_InvalidSourceUrl_Returns400WithFieldError()
    {
        var response = await Client.PostAsJsonAsync("/api/articles", new { title = "Title", content = "x", sourceUrl = "not-a-url" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("SourceUrl");
    }
}
