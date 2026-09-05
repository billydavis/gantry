using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Resources;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.AspNetCore.Http;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Resources.Update;

[Trait("Category", "Integration")]
public class UpdateResourceEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Update_ExistingResource_UpdatesFields()
    {
        await using var dbContext = CreateDbContext();
        var resource = await ResourceFactory.CreateResourceAsync(dbContext, name: "Old Name");

        var response = await Client.PutAsJsonAsync($"/api/resources/{resource.Id}", new
        {
            name = "New Name",
            location = "https://new.example.com",
            type = "GitRepository",
            sortOrder = 5
        });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ResourceResponse>();
        body!.Name.ShouldBe("New Name");
        body.Type.ShouldBe("GitRepository");
        body.SortOrder.ShouldBe(5);
    }

    [Fact]
    public async Task Update_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PutAsJsonAsync($"/api/resources/{Guid.NewGuid()}", new
        {
            name = "Name",
            location = "loc",
            type = "Website",
            sortOrder = 0
        });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Resource not found.\"");
    }

    [Fact]
    public async Task Update_InvalidType_Returns400WithFieldError()
    {
        await using var dbContext = CreateDbContext();
        var resource = await ResourceFactory.CreateResourceAsync(dbContext);

        var response = await Client.PutAsJsonAsync($"/api/resources/{resource.Id}", new
        {
            name = "Name",
            location = "loc",
            type = "NotAType",
            sortOrder = 0
        });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        problem!.Errors.ShouldContainKey("Type");
    }
}
