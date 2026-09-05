using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Wins;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.Update;

[Trait("Category", "Integration")]
public class UpdateWinEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/wins/{Guid.NewGuid()}", new
        {
            title = "Whatever",
            date = "2026-01-15"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Win not found.\"");
    }

    [Fact]
    public async Task Update_ExistingWin_UpdatesFields()
    {
        await using var dbContext = CreateDbContext();
        var win = await WinFactory.CreateWinAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/wins/{win.Id}", new
        {
            title = "New title",
            impact = "New impact",
            date = "2026-01-15"
        });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<WinResponse>();
        body!.Title.ShouldBe("New title");
        body.Impact.ShouldBe("New impact");
    }
}
