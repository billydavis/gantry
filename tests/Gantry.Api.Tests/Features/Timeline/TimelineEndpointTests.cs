using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Timeline;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Timeline;

[Trait("Category", "Integration")]
public class TimelineEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Timeline_WinInMonth_IsIncluded()
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext, "Timeline Project");
        dbContext.Wins.Add(new Win
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Title = "March win",
            Date = new DateOnly(2026, 3, 15),
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/timeline?year=2026&month=3");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TimelineItem[]>();
        body!.ShouldContain(i => i.Type == "Win" && i.Title == "March win" && i.ProjectName == "Timeline Project");
    }

    [Fact]
    public async Task Timeline_WinOutsideMonth_IsExcluded()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Wins.Add(new Win
        {
            Id = Guid.NewGuid(),
            Title = "April win",
            Date = new DateOnly(2026, 4, 1),
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/timeline?year=2026&month=3");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TimelineItem[]>();
        body!.ShouldNotContain(i => i.Title == "April win");
    }

    [Fact]
    public async Task Timeline_SoftDeletedWin_IsExcluded()
    {
        await using var dbContext = CreateDbContext();
        await WinFactory.CreateWinAsync(dbContext, title: "Deleted win", date: new DateOnly(2026, 3, 12), deletedUtc: DateTime.UtcNow);

        var response = await Client.GetAsync("/api/timeline?year=2026&month=3");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TimelineItem[]>();
        body!.ShouldNotContain(i => i.Title == "Deleted win");
    }

    [Fact]
    public async Task Timeline_TodoCompletedInMonth_IsIncluded()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, title: "Completed in March", status: TodoStatus.Complete);
        todo.CompletedUtc = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc);
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/timeline?year=2026&month=3");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TimelineItem[]>();
        body!.ShouldContain(i => i.Type == "Todo" && i.Title == "Completed in March");
    }

    [Fact]
    public async Task Timeline_IncompleteTodo_IsExcluded()
    {
        await using var dbContext = CreateDbContext();
        await TodoFactory.CreateTodoAsync(dbContext, title: "Still open", status: TodoStatus.Todo);

        var response = await Client.GetAsync($"/api/timeline?year={DateTime.UtcNow.Year}&month={DateTime.UtcNow.Month}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TimelineItem[]>();
        body!.ShouldNotContain(i => i.Title == "Still open");
    }

    [Fact]
    public async Task Timeline_SoftDeletedCompletedTodo_IsExcluded()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, title: "Deleted after completion", status: TodoStatus.Complete, deletedUtc: DateTime.UtcNow);
        todo.CompletedUtc = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc);
        await dbContext.SaveChangesAsync();

        var response = await Client.GetAsync("/api/timeline?year=2026&month=3");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TimelineItem[]>();
        body!.ShouldNotContain(i => i.Title == "Deleted after completion");
    }
}
