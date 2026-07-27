namespace Gantry.Api.Features.Todos.Create;

public record Request(
    Guid? ProjectId,
    string Title,
    string? Description,
    string? Priority,
    int? EstimatedMinutes,
    DateOnly? DueDate);
