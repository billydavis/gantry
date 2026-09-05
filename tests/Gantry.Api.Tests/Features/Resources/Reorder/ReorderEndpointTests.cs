using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Resources.Reorder;

[Trait("Category", "Integration")]
public class ReorderEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Reorder_ExistingResources_UpdatesSortOrder()
    {
        await using var dbContext = CreateDbContext();
        var first = await ResourceFactory.CreateResourceAsync(dbContext, name: "First", sortOrder: 0);
        var second = await ResourceFactory.CreateResourceAsync(dbContext, name: "Second", sortOrder: 1);

        var response = await Client.PutAsJsonAsync("/api/resources/reorder", new object[]
        {
            new { id = first.Id, sortOrder = 10 },
            new { id = second.Id, sortOrder = 5 }
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await using var verifyContext = CreateDbContext();
        (await verifyContext.Resources.FirstAsync(r => r.Id == first.Id)).SortOrder.ShouldBe(10);
        (await verifyContext.Resources.FirstAsync(r => r.Id == second.Id)).SortOrder.ShouldBe(5);
    }

    [Fact]
    public async Task Reorder_UnknownIdInList_IsSilentlySkipped()
    {
        // The endpoint only updates resources it finds via `Where(ids.Contains)`; an id with no
        // matching resource has no corresponding entity to update and is not treated as an error.
        var response = await Client.PutAsJsonAsync("/api/resources/reorder", new object[]
        {
            new { id = Guid.NewGuid(), sortOrder = 1 }
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Reorder_EmptyList_ReturnsNoContent()
    {
        var response = await Client.PutAsJsonAsync("/api/resources/reorder", Array.Empty<object>());

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }
}
