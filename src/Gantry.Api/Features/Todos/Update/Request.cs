namespace Gantry.Api.Features.Todos.Update;

public record Request(
    Guid? ProjectId,
    string Title,
    string? Description,
    string? Link,
    string? Status,
    string? Priority,
    int? EstimatedMinutes,
    DateOnly? DueDate,
    string? RecurrenceType,
    int? RecurrenceIntervalDays);
