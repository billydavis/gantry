using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Tags;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Create;

[Trait("Category", "Integration")]
public class CreateTagEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Create_ValidRequest_Returns201()
    {
        var response = await Client.PostAsJsonAsync("/api/tags", new { name = "backend", color = "#4dabf7" });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<TagResponse>();
        body!.Name.ShouldBe("backend");
    }

    [Fact]
    public async Task Create_DuplicateNameCaseInsensitive_Returns409WithMessage()
    {
        await using var dbContext = CreateDbContext();
        await TagFactory.CreateTagAsync(dbContext, name: "backend");

        var response = await Client.PostAsJsonAsync("/api/tags", new { name = "BACKEND" });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("A tag with that name already exists.");
    }
}
