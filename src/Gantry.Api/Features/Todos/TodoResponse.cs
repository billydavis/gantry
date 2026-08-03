using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Tags;

namespace Gantry.Api.Features.Todos;

public record TodoResponse(
    Guid Id,
    Guid? ProjectId,
    string? ProjectName,
    string Title,
    string? Description,
    string? Link,
    string Status,
    string Priority,
    bool IsPinned,
    int? EstimatedMinutes,
    DateOnly? DueDate,
    DateTime? CompletedUtc,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    TagResponse[] Tags)
{
    public static TodoResponse FromEntity(Todo t) => new(
        t.Id,
        t.ProjectId,
        t.Project?.Name,
        t.Title,
        t.Description,
        t.Link,
        t.Status.ToString(),
        t.Priority.ToString(),
        t.IsPinned,
        t.EstimatedMinutes,
        t.DueDate,
        t.CompletedUtc,
        t.CreatedUtc,
        t.UpdatedUtc,
        t.Tags.Select(TagResponse.FromEntity).ToArray());
}
