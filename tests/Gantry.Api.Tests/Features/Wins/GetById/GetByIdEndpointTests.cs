using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Wins;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.GetById;

[Trait("Category", "Integration")]
public class GetByIdEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_ExistingWin_ReturnsIt()
    {
        await using var dbContext = CreateDbContext();
        var win = await WinFactory.CreateWinAsync(dbContext, title: "Find me");

        var response = await Client.GetAsync($"/api/wins/{win.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<WinResponse>();
        body!.Title.ShouldBe("Find me");
    }

    [Fact]
    public async Task Get_UnknownId_Returns404WithMessage()
    {
        var response = await Client.GetAsync($"/api/wins/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Win not found.\"");
    }

    [Fact]
    public async Task Get_SoftDeletedWin_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var win = await WinFactory.CreateWinAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync($"/api/wins/{win.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}
