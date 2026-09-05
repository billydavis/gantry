using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Tags;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Update;

[Trait("Category", "Integration")]
public class UpdateTagEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_ExistingTag_UpdatesFields()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext, name: "Old");

        var response = await Client.PutAsJsonAsync($"/api/tags/{tag.Id}", new { name = "New", color = "#000000" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TagResponse>();
        body!.Name.ShouldBe("New");
        body.Color.ShouldBe("#000000");
    }

    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/tags/{Guid.NewGuid()}", new { name = "Name" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Tag not found.\"");
    }

    [Fact]
    public async Task Update_NameCollidesWithAnotherTag_ReturnsConflictAndLeavesTagUnchanged()
    {
        await using var dbContext = CreateDbContext();
        await TagFactory.CreateTagAsync(dbContext, name: "Work");
        var tagToRename = await TagFactory.CreateTagAsync(dbContext, name: "Personal");

        var response = await Client.PutAsJsonAsync($"/api/tags/{tagToRename.Id}", new { name = "Work" });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await dbContext.Tags.FindAsync(tagToRename.Id))!.Name.ShouldBe("Personal");
    }

    [Fact]
    public async Task Update_NameCollidesCaseInsensitively_ReturnsConflict()
    {
        await using var dbContext = CreateDbContext();
        await TagFactory.CreateTagAsync(dbContext, name: "Work");
        var tagToRename = await TagFactory.CreateTagAsync(dbContext, name: "Personal");

        var response = await Client.PutAsJsonAsync($"/api/tags/{tagToRename.Id}", new { name = "work" });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Update_RenameToOwnCurrentName_Succeeds()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext, name: "Work");

        var response = await Client.PutAsJsonAsync($"/api/tags/{tag.Id}", new { name = "Work" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Update_RenameToOwnNameWithDifferentCasing_Succeeds()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext, name: "Work");

        var response = await Client.PutAsJsonAsync($"/api/tags/{tag.Id}", new { name = "WORK" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TagResponse>();
        body!.Name.ShouldBe("WORK");
    }
}
