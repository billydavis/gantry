using System.Net;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Environments.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_ExistingEnvironment_Returns204()
    {
        await using var dbContext = CreateDbContext();
        var env = await EnvironmentFactory.CreateEnvironmentAsync(dbContext);

        var response = await Client.DeleteAsync($"/api/environments/{env.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.DeleteAsync($"/api/environments/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Environment not found.\"");
    }
}
