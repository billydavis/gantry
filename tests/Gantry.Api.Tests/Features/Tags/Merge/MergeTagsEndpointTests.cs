using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Search;
using Gantry.Api.Features.Tags;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Merge;

[Trait("Category", "Integration")]
public class MergeTagsEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Merge_SourceEqualsTarget_ReturnsBadRequest()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);

        var response = await Client.PostAsync($"/api/tags/{tag.Id}/merge/{tag.Id}", null);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Merge_UnknownSource_Returns404WithMessage()
    {
        await using var dbContext = CreateDbContext();
        var target = await TagFactory.CreateTagAsync(dbContext);

        var response = await Client.PostAsync($"/api/tags/{Guid.NewGuid()}/merge/{target.Id}", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.Content.ReadAsStringAsync()).ShouldBe("\"Source tag not found.\"");
    }

    [Fact]
    public async Task Merge_UnknownTarget_Returns404WithMessage()
    {
        await using var dbContext = CreateDbContext();
        var source = await TagFactory.CreateTagAsync(dbContext);

        var response = await Client.PostAsync($"/api/tags/{source.Id}/merge/{Guid.NewGuid()}", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.Content.ReadAsStringAsync()).ShouldBe("\"Target tag not found.\"");
    }

    [Fact]
    public async Task Merge_DeletesSourceTag()
    {
        await using var dbContext = CreateDbContext();
        var source = await TagFactory.CreateTagAsync(dbContext, name: "source");
        var target = await TagFactory.CreateTagAsync(dbContext, name: "target");

        await Client.PostAsync($"/api/tags/{source.Id}/merge/{target.Id}", null);

        dbContext.ChangeTracker.Clear();
        (await dbContext.Tags.FindAsync(source.Id)).ShouldBeNull();
    }

    [Fact]
    public async Task Merge_ReturnsTargetResponseWithUpdatedUsageCount()
    {
        await using var dbContext = CreateDbContext();
        var source = await TagFactory.CreateTagAsync(dbContext, name: "source");
        var target = await TagFactory.CreateTagAsync(dbContext, name: "target");
        var todo = await TodoFactory.CreateTodoAsync(dbContext);
        await TagFactory.AssignToTodoAsync(dbContext, todo, source);

        var response = await Client.PostAsync($"/api/tags/{source.Id}/merge/{target.Id}", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TagResponse>();
        body!.Id.ShouldBe(target.Id);
        body.UsageCount.ShouldBe(1);
    }

    [Theory]
    [InlineData("Project")]
    [InlineData("Todo")]
    [InlineData("Note")]
    [InlineData("Resource")]
    [InlineData("Win")]
    [InlineData("Article")]
    public async Task Merge_RetagsEntityFromSourceToTarget(string entityType)
    {
        await using var dbContext = CreateDbContext();
        var source = await TagFactory.CreateTagAsync(dbContext, name: "source");
        var target = await TagFactory.CreateTagAsync(dbContext, name: "target");

        Guid entityId = entityType switch
        {
            "Project" => (await CreateTaggedProjectAsync(dbContext, source)).Id,
            "Todo" => (await CreateTaggedTodoAsync(dbContext, source)).Id,
            "Note" => (await CreateTaggedNoteAsync(dbContext, source)).Id,
            "Resource" => (await CreateTaggedResourceAsync(dbContext, source)).Id,
            "Win" => (await CreateTaggedWinAsync(dbContext, source)).Id,
            "Article" => (await CreateTaggedArticleAsync(dbContext, source)).Id,
            _ => throw new InvalidOperationException(),
        };

        var response = await Client.PostAsync($"/api/tags/{source.Id}/merge/{target.Id}", null);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var usage = await Client.GetFromJsonAsync<SearchResult[]>($"/api/tags/{target.Id}/usage");
        usage!.ShouldContain(r => r.Type == entityType && r.Id == entityId);
    }

    [Fact]
    public async Task Merge_EntityTaggedWithBothSourceAndTarget_EndsUpWithSingleTargetTag()
    {
        await using var dbContext = CreateDbContext();
        var source = await TagFactory.CreateTagAsync(dbContext, name: "source");
        var target = await TagFactory.CreateTagAsync(dbContext, name: "target");
        var todo = await TodoFactory.CreateTodoAsync(dbContext);
        await TagFactory.AssignToTodoAsync(dbContext, todo, source);
        await TagFactory.AssignToTodoAsync(dbContext, todo, target);

        var response = await Client.PostAsync($"/api/tags/{source.Id}/merge/{target.Id}", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        dbContext.ChangeTracker.Clear();
        var reloaded = await dbContext.Todos.Include(t => t.Tags).FirstAsync(t => t.Id == todo.Id);
        reloaded.Tags.Count.ShouldBe(1);
        reloaded.Tags.Single().Id.ShouldBe(target.Id);
    }

    private static async Task<Project> CreateTaggedProjectAsync(AppDbContext db, Tag tag)
    {
        var entity = await ProjectFactory.CreateProjectAsync(db);
        await TagFactory.AssignToProjectAsync(db, entity, tag);
        return entity;
    }

    private static async Task<Todo> CreateTaggedTodoAsync(AppDbContext db, Tag tag)
    {
        var entity = await TodoFactory.CreateTodoAsync(db);
        await TagFactory.AssignToTodoAsync(db, entity, tag);
        return entity;
    }

    private static async Task<Note> CreateTaggedNoteAsync(AppDbContext db, Tag tag)
    {
        var entity = await NoteFactory.CreateNoteAsync(db);
        await TagFactory.AssignToNoteAsync(db, entity, tag);
        return entity;
    }

    private static async Task<Resource> CreateTaggedResourceAsync(AppDbContext db, Tag tag)
    {
        var entity = await ResourceFactory.CreateResourceAsync(db);
        await TagFactory.AssignToResourceAsync(db, entity, tag);
        return entity;
    }

    private static async Task<Win> CreateTaggedWinAsync(AppDbContext db, Tag tag)
    {
        var entity = await WinFactory.CreateWinAsync(db);
        await TagFactory.AssignToWinAsync(db, entity, tag);
        return entity;
    }

    private static async Task<Article> CreateTaggedArticleAsync(AppDbContext db, Tag tag)
    {
        var entity = await ArticleFactory.CreateArticleAsync(db);
        await TagFactory.AssignToArticleAsync(db, entity, tag);
        return entity;
    }
}
