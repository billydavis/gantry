using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Search;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Usage;

[Trait("Category", "Integration")]
public class GetTagUsageEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task GetUsage_UnknownTag_Returns404WithMessage()
    {
        var response = await Client.GetAsync($"/api/tags/{Guid.NewGuid()}/usage");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Tag not found.\"");
    }

    [Fact]
    public async Task GetUsage_UnusedTag_ReturnsEmptyArray()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);

        var response = await Client.GetAsync($"/api/tags/{tag.Id}/usage");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetUsage_TaggedAcrossAllEntityTypes_ReturnsOneResultPerItem()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);

        var project = await ProjectFactory.CreateProjectAsync(dbContext, name: "Proj");
        await TagFactory.AssignToProjectAsync(dbContext, project, tag);

        var todo = await TodoFactory.CreateTodoAsync(dbContext, title: "Todo item");
        await TagFactory.AssignToTodoAsync(dbContext, todo, tag);

        var note = await NoteFactory.CreateNoteAsync(dbContext, title: "Note item");
        await TagFactory.AssignToNoteAsync(dbContext, note, tag);

        var resource = await ResourceFactory.CreateResourceAsync(dbContext, name: "Resource item");
        await TagFactory.AssignToResourceAsync(dbContext, resource, tag);

        var win = await WinFactory.CreateWinAsync(dbContext, title: "Win item");
        await TagFactory.AssignToWinAsync(dbContext, win, tag);

        var article = await ArticleFactory.CreateArticleAsync(dbContext, title: "Article item");
        await TagFactory.AssignToArticleAsync(dbContext, article, tag);

        var response = await Client.GetAsync($"/api/tags/{tag.Id}/usage");

        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.Length.ShouldBe(6);
        body.ShouldContain(r => r.Type == "Project" && r.Id == project.Id);
        body.ShouldContain(r => r.Type == "Todo" && r.Id == todo.Id);
        body.ShouldContain(r => r.Type == "Note" && r.Id == note.Id);
        body.ShouldContain(r => r.Type == "Resource" && r.Id == resource.Id);
        body.ShouldContain(r => r.Type == "Win" && r.Id == win.Id);
        body.ShouldContain(r => r.Type == "Article" && r.Id == article.Id);
    }

    [Fact]
    public async Task GetUsage_SoftDeletedTodo_ExcludedFromResults()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);
        var todo = await TodoFactory.CreateTodoAsync(dbContext, deletedUtc: DateTime.UtcNow);
        await TagFactory.AssignToTodoAsync(dbContext, todo, tag);

        var response = await Client.GetAsync($"/api/tags/{tag.Id}/usage");

        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldBeEmpty();
    }
}
