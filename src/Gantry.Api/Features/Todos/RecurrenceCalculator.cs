using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Todos;

public static class RecurrenceCalculator
{
    public static DateOnly CalculateNextDueDate(DateOnly currentDueDate, RecurrenceType type, int? intervalDays) =>
        type switch
        {
            RecurrenceType.Daily => currentDueDate.AddDays(1),
            RecurrenceType.Weekly => currentDueDate.AddDays(7),
            RecurrenceType.Monthly => AddMonthAnchoredToMonthEnd(currentDueDate),
            RecurrenceType.Custom => currentDueDate.AddDays(intervalDays ?? throw new InvalidOperationException(
                "RecurrenceIntervalDays is required for Custom recurrence.")),
            _ => throw new InvalidOperationException($"Cannot calculate next due date for recurrence type {type}.")
        };

    /// <summary>
    /// Advances by one calendar month. If <paramref name="date"/> falls on the last day of its month
    /// (e.g. Jan 31, Feb 28), the result is likewise pinned to the last day of the following month, so a
    /// month-end due date stays anchored to month-end indefinitely instead of drifting down to whatever day
    /// a short month happened to clamp it to (plain <c>AddMonths</c> would turn Jan 31 -> Feb 28 -> Mar 28).
    /// </summary>
    private static DateOnly AddMonthAnchoredToMonthEnd(DateOnly date)
    {
        if (date.Day != DateTime.DaysInMonth(date.Year, date.Month))
            return date.AddMonths(1);

        var firstOfNextMonth = new DateOnly(date.Year, date.Month, 1).AddMonths(1);
        return new DateOnly(firstOfNextMonth.Year, firstOfNextMonth.Month,
            DateTime.DaysInMonth(firstOfNextMonth.Year, firstOfNextMonth.Month));
    }

    public static Todo? TrySpawnNextOccurrence(Todo completedTodo)
    {
        if (completedTodo.RecurrenceType == RecurrenceType.None || completedTodo.DueDate is null)
            return null;

        var now = DateTime.UtcNow;
        return new Todo
        {
            Id = Guid.NewGuid(),
            ProjectId = completedTodo.ProjectId,
            Title = completedTodo.Title,
            Description = completedTodo.Description,
            Link = completedTodo.Link,
            Status = TodoStatus.Todo,
            Priority = completedTodo.Priority,
            EstimatedMinutes = completedTodo.EstimatedMinutes,
            DueDate = CalculateNextDueDate(completedTodo.DueDate.Value, completedTodo.RecurrenceType, completedTodo.RecurrenceIntervalDays),
            RecurrenceType = completedTodo.RecurrenceType,
            RecurrenceIntervalDays = completedTodo.RecurrenceIntervalDays,
            RecurrenceParentId = completedTodo.Id,
            CreatedUtc = now,
            UpdatedUtc = now,
            Tags = completedTodo.Tags.ToList()
        };
    }
}
