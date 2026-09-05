using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Tags;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.List;

[Trait("Category", "Integration")]
public class ListEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task List_ReturnsTagsOrderedByName()
    {
        await using var dbContext = CreateDbContext();
        await TagFactory.CreateTagAsync(dbContext, name: "zebra");
        await TagFactory.CreateTagAsync(dbContext, name: "apple");

        var response = await Client.GetAsync("/api/tags");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TagResponse[]>();
        body!.First().Name.ShouldBe("apple");
    }

    [Fact]
    public async Task List_UnusedTag_ReturnsZeroUsageCount()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext, name: "unused");

        var response = await Client.GetAsync("/api/tags");

        var body = await response.Content.ReadFromJsonAsync<TagResponse[]>();
        body!.Single(t => t.Id == tag.Id).UsageCount.ShouldBe(0);
    }

    [Fact]
    public async Task List_TagUsedAcrossMultipleEntityTypes_SumsUsageCount()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext, name: "widely-used");

        var project = await ProjectFactory.CreateProjectAsync(dbContext);
        await TagFactory.AssignToProjectAsync(dbContext, project, tag);

        var todo1 = await TodoFactory.CreateTodoAsync(dbContext);
        await TagFactory.AssignToTodoAsync(dbContext, todo1, tag);
        var todo2 = await TodoFactory.CreateTodoAsync(dbContext);
        await TagFactory.AssignToTodoAsync(dbContext, todo2, tag);

        var note = await NoteFactory.CreateNoteAsync(dbContext);
        await TagFactory.AssignToNoteAsync(dbContext, note, tag);

        var response = await Client.GetAsync("/api/tags");

        var body = await response.Content.ReadFromJsonAsync<TagResponse[]>();
        body!.Single(t => t.Id == tag.Id).UsageCount.ShouldBe(4);
    }
}
