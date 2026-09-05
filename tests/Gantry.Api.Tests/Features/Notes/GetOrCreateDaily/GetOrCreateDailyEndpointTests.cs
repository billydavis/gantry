using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Features.Notes;
using Gantry.Api.Tests.Infrastructure;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.GetOrCreateDaily;

[Trait("Category", "Integration")]
public class GetOrCreateDailyEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Get_ValidDate_CreatesNoteWithTemplate()
    {
        var response = await Client.GetAsync("/api/notes/daily/2026-01-15");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<NoteResponse>();
        body!.Date.ShouldBe(new DateOnly(2026, 1, 15));
        body.Content.ShouldContain("## Meetings");
    }

    [Fact]
    public async Task Get_SameDateTwice_IsIdempotent()
    {
        var first = await Client.GetAsync("/api/notes/daily/2026-02-01");
        var firstBody = await first.Content.ReadFromJsonAsync<NoteResponse>();

        var second = await Client.GetAsync("/api/notes/daily/2026-02-01");
        var secondBody = await second.Content.ReadFromJsonAsync<NoteResponse>();

        secondBody!.Id.ShouldBe(firstBody!.Id);
    }

    [Fact]
    public async Task Get_InvalidDateFormat_Returns400()
    {
        var response = await Client.GetAsync("/api/notes/daily/not-a-date");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Date must be in yyyy-MM-dd format.\"");
    }
}
