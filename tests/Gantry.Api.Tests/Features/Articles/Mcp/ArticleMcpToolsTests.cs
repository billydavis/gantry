using Gantry.Api.Features.Articles.Mcp;
using Gantry.Api.Features.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateArticleRequest = Gantry.Api.Features.Articles.Create.CreateArticleRequest;
using UpdateArticleRequest = Gantry.Api.Features.Articles.Update.UpdateArticleRequest;

namespace Gantry.Api.Tests.Features.Articles.Mcp;

[Trait("Category", "Integration")]
public class ArticleMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateArticle_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await ArticleMcpTools.CreateArticle(
            new CreateArticleRequest("Title", "Content", null, null), dbContext, CancellationToken.None);

        result.Title.ShouldBe("Title");
    }

    [Fact]
    public async Task CreateArticle_InvalidSourceUrl_ThrowsMcpToolValidationExceptionWithFieldMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpToolValidationException>(() => ArticleMcpTools.CreateArticle(
            new CreateArticleRequest("Title", "Content", null, "not-a-url"), dbContext, CancellationToken.None));

        ex.Message.ShouldContain("SourceUrl:");
    }

    [Fact]
    public async Task GetArticle_NotFound_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => ArticleMcpTools.GetArticle(Guid.NewGuid(), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Article not found.");
    }

    [Fact]
    public async Task UpdateArticle_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => ArticleMcpTools.UpdateArticle(
            Guid.NewGuid(), new UpdateArticleRequest("Title", "Content", null, null), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Article not found.");
    }

    [Fact]
    public async Task ListArticles_ReturnsCreatedArticle()
    {
        await using var dbContext = CreateDbContext();
        var article = await ArticleFactory.CreateArticleAsync(dbContext, title: "Findable");

        var result = await ArticleMcpTools.ListArticles(dbContext, CancellationToken.None);

        result.ShouldContain(a => a.Id == article.Id);
    }
}
