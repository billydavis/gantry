using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Environments;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Environments.Update;

[Trait("Category", "Integration")]
public class UpdateEnvironmentEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_ExistingEnvironment_UpdatesFields()
    {
        await using var dbContext = CreateDbContext();
        var env = await EnvironmentFactory.CreateEnvironmentAsync(dbContext, name: "Old");

        var response = await Client.PutAsJsonAsync($"/api/environments/{env.Id}", new
        {
            name = "New",
            baseUrl = "https://new.example.com",
            sortOrder = 2
        });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<EnvironmentResponse>();
        body!.Name.ShouldBe("New");
        body.SortOrder.ShouldBe(2);
    }

    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/environments/{Guid.NewGuid()}", new
        {
            name = "Name",
            sortOrder = 0
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Environment not found.\"");
    }
}
