using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Environments;

public record EnvironmentResponse(
    Guid Id,
    Guid? ProjectId,
    string Name,
    string? BaseUrl,
    int SortOrder,
    DateTime CreatedUtc,
    DateTime UpdatedUtc)
{
    public static EnvironmentResponse FromEntity(ProjectEnvironment e) => new(
        e.Id,
        e.ProjectId,
        e.Name,
        e.BaseUrl,
        e.SortOrder,
        e.CreatedUtc,
        e.UpdatedUtc);
}
