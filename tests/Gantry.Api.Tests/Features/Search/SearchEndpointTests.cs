using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Search;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Search;

[Trait("Category", "Integration")]
public class SearchEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Search_MatchingTodoTitle_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Migrate the search index");
        await TodoFactory.CreateTodoAsync(dbContext, title: "Unrelated task");

        var response = await Client.GetAsync("/api/search?q=search+index");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldContain(r => r.Type == "Todo" && r.Title == "Migrate the search index");
        body!.ShouldNotContain(r => r.Title == "Unrelated task");
    }

    [Fact]
    public async Task Search_MatchingProjectName_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateProjectAsync(dbContext, "Gantry Dashboard");

        var response = await Client.GetAsync("/api/search?q=Dashboard");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldContain(r => r.Type == "Project" && r.Title == "Gantry Dashboard");
    }

    [Fact]
    public async Task Search_ExcludesSoftDeletedTodos()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Deleted search hit", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/search?q=search+hit");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldNotContain(r => r.Title == "Deleted search hit");
    }

    [Fact]
    public async Task Search_ExcludesSoftDeletedNotes()
    {
        await using var dbContext = CreateDbContext();
        await NoteFactory.CreateNoteAsync(dbContext, title: "Deleted note hit", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/search?q=note+hit");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldNotContain(r => r.Title == "Deleted note hit");
    }

    [Fact]
    public async Task Search_ExcludesSoftDeletedWins()
    {
        await using var dbContext = CreateDbContext();
        await WinFactory.CreateWinAsync(dbContext, title: "Deleted win hit", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/search?q=win+hit");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldNotContain(r => r.Title == "Deleted win hit");
    }

    [Fact]
    public async Task Search_ExcludesSoftDeletedArticles()
    {
        await using var dbContext = CreateDbContext();
        await ArticleFactory.CreateArticleAsync(dbContext, title: "Deleted article hit", deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/search?q=article+hit");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldNotContain(r => r.Title == "Deleted article hit");
    }

    [Fact]
    public async Task Search_QueryTooShort_ReturnsEmptyResults()
    {
        var response = await Client.GetAsync("/api/search?q=a");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body.ShouldBeEmpty();
    }

    [Fact]
    public async Task Search_MatchingWin_ReturnsItWithProjectName()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext, "Client Rollout");
        dbContext.Wins.Add(new Win
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Title = "Shipped the onboarding flow",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/search?q=onboarding");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldContain(r => r.Type == "Win" && r.Title == "Shipped the onboarding flow" && r.ProjectName == "Client Rollout");
    }

    [Fact]
    public async Task Search_MatchingArticle_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Articles.Add(new Article
        {
            Id = Guid.NewGuid(),
            Title = "Postgres JSONB tips",
            Content = "Some content about jsonb columns.",
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/search?q=jsonb");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SearchResult[]>();
        body!.ShouldContain(r => r.Type == "Article" && r.Title == "Postgres JSONB tips");
    }
}
