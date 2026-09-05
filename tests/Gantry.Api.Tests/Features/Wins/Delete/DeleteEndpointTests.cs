using System.Net;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.Delete;

[Trait("Category", "Integration")]
public class DeleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Delete_ExistingWin_SoftDeletesIt()
    {
        await using var dbContext = CreateDbContext();
        var win = await WinFactory.CreateWinAsync(dbContext);

        var response = await Client.DeleteAsync($"/api/wins/{win.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await using var verifyContext = CreateDbContext();
        var persisted = await verifyContext.Wins.FirstAsync(w => w.Id == win.Id);
        persisted.DeletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Delete_AlreadyDeletedWin_Returns404()
    {
        await using var dbContext = CreateDbContext();
        var win = await WinFactory.CreateWinAsync(dbContext, deletedUtc: DateTime.UtcNow);

        var response = await Client.DeleteAsync($"/api/wins/{win.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.DeleteAsync($"/api/wins/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Win not found.\"");
    }
}
