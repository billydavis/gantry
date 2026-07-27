namespace Gantry.Api.Features.Todos.Update;

public record Request(
    Guid? ProjectId,
    string Title,
    string? Description,
    string? Status,
    string? Priority,
    int? EstimatedMinutes,
    DateOnly? DueDate);
