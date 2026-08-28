using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Articles.Create;
using Gantry.Api.Features.Articles.Update;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Articles.Mcp;

[McpServerToolType]
public class ArticleMcpTools
{
    [McpServerTool(Name = "create_article"), Description("Creates a new article (a saved reference write-up, not tied to a project). This is the entity behind Gantry's Knowledge Base UI section (formerly called the Wiki) -- use this tool for requests to add/push/save something to the knowledge base or wiki.")]
    public static async Task<ArticleResponse> CreateArticle(
        CreateArticleRequest request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ArticleResponse>(await Create.Endpoint.Handle(request, db, ct));

    [McpServerTool(Name = "update_article"), Description("Updates an existing article (Knowledge Base / Wiki entry).")]
    public static async Task<ArticleResponse> UpdateArticle(
        [Description("The article's id.")] Guid id,
        UpdateArticleRequest request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ArticleResponse>(await Update.Endpoint.Handle(id, request, db, ct));

    [McpServerTool(Name = "list_articles"), Description("Lists articles (Knowledge Base / Wiki entries), alphabetically by title.")]
    public static async Task<IEnumerable<ArticleResponse>> ListArticles(
        AppDbContext db,
        CancellationToken ct,
        [Description("Filter to a category.")] string? category = null,
        [Description("Filter to articles carrying this tag.")] Guid? tagId = null,
        [Description("Case-insensitive text to match against article title, content, category, or tag names (min 2 characters).")] string? q = null)
        => McpResultAdapter.Unwrap<IEnumerable<ArticleResponse>>(await List.Endpoint.Handle(db, ct, category, tagId, q));

    [McpServerTool(Name = "get_article"), Description("Gets a single article (Knowledge Base / Wiki entry) by id.")]
    public static async Task<ArticleResponse> GetArticle(
        [Description("The article's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<ArticleResponse>(await GetById.Endpoint.Handle(db, id, ct));
}
