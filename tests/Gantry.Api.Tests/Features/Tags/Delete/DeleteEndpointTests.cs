using System.Net;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_ExistingTag_Returns204()
    {
        await using var dbContext = CreateDbContext();
        var tag = await TagFactory.CreateTagAsync(dbContext);

        var response = await Client.DeleteAsync($"/api/tags/{tag.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.DeleteAsync($"/api/tags/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Tag not found.\"");
    }
}
