using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Tags;

namespace Gantry.Api.Features.Wins;

public record WinResponse(
    Guid Id,
    Guid? ProjectId,
    string? ProjectName,
    string Title,
    string? Description,
    string? Impact,
    DateOnly Date,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    TagResponse[] Tags)
{
    public static WinResponse FromEntity(Win w) => new(
        w.Id,
        w.ProjectId,
        w.Project?.Name,
        w.Title,
        w.Description,
        w.Impact,
        w.Date,
        w.CreatedUtc,
        w.UpdatedUtc,
        w.Tags.Select(TagResponse.FromEntity).ToArray());
}
