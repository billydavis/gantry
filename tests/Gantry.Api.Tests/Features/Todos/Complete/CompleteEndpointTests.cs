using System.Net;
using System.Net.Http.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Todos;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Complete;

[Trait("Category", "Integration")]
public class CompleteEndpointTests(DatabaseFixture db) : IntegrationTestBase(db)
{
    [Fact]
    public async Task Complete_ExistingTodo_SetsStatusAndCompletedUtc()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext);

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/complete", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<TodoResponse>();
        body!.Status.ShouldBe("Complete");
        body.CompletedUtc.ShouldNotBeNull();
    }

    [Fact]
    public async Task Complete_UnknownId_Returns404WithMessage()
    {
        var response = await Client.PostAsync($"/api/todos/{Guid.NewGuid()}/complete", null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldBe("\"Todo not found.\"");
    }

    [Theory]
    [InlineData(RecurrenceType.Daily, null, "2026-01-02")]
    [InlineData(RecurrenceType.Weekly, null, "2026-01-08")]
    [InlineData(RecurrenceType.Monthly, null, "2026-02-01")]
    [InlineData(RecurrenceType.Custom, 10, "2026-01-11")]
    public async Task Complete_RecurringTodo_SpawnsNextOccurrenceOnSchedule(
        RecurrenceType recurrenceType, int? intervalDays, string expectedNextDueDate)
    {
        await using var dbContext = CreateDbContext();
        var project = await TodoFactory.CreateProjectAsync(dbContext);
        var todo = await TodoFactory.CreateTodoAsync(
            dbContext,
            title: "Water plants",
            projectId: project.Id,
            priority: Priority.High,
            dueDate: new DateOnly(2026, 1, 1),
            recurrenceType: recurrenceType,
            recurrenceIntervalDays: intervalDays);
        todo.EstimatedMinutes = 15;
        await dbContext.SaveChangesAsync();

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/complete", null);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var next = await dbContext.Todos.SingleAsync(t => t.RecurrenceParentId == todo.Id);
        next.Title.ShouldBe("Water plants");
        next.ProjectId.ShouldBe(project.Id);
        next.Priority.ShouldBe(Priority.High);
        next.EstimatedMinutes.ShouldBe(15);
        next.Status.ShouldBe(TodoStatus.Todo);
        next.DueDate.ShouldBe(DateOnly.Parse(expectedNextDueDate));
        next.RecurrenceType.ShouldBe(recurrenceType);
        next.RecurrenceIntervalDays.ShouldBe(intervalDays);
    }

    [Fact]
    public async Task Complete_NonRecurringTodo_DoesNotSpawnNextOccurrence()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(dbContext, dueDate: new DateOnly(2026, 1, 1));

        var response = await Client.PostAsync($"/api/todos/{todo.Id}/complete", null);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        (await dbContext.Todos.AnyAsync(t => t.RecurrenceParentId == todo.Id)).ShouldBeFalse();
    }

    [Fact]
    public async Task Complete_RecurringTodoTwice_SpawnsOnlyOnce()
    {
        await using var dbContext = CreateDbContext();
        var todo = await TodoFactory.CreateTodoAsync(
            dbContext, dueDate: new DateOnly(2026, 1, 1), recurrenceType: RecurrenceType.Daily);

        await Client.PostAsync($"/api/todos/{todo.Id}/complete", null);
        await Client.PostAsync($"/api/todos/{todo.Id}/complete", null);

        var spawnedCount = await dbContext.Todos.CountAsync(t => t.RecurrenceParentId == todo.Id);
        spawnedCount.ShouldBe(1);
    }
}
