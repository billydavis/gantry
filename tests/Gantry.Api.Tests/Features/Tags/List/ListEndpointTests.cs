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
}
