using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Tags;

namespace Gantry.Api.Features.Resources;

public record ResourceResponse(
    Guid Id,
    Guid? ProjectId,
    string Name,
    string Location,
    string Type,
    string? Description,
    int SortOrder,
    Guid? EnvironmentId,
    string? EnvironmentName,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    TagResponse[] Tags)
{
    public static ResourceResponse FromEntity(Resource r) => new(
        r.Id,
        r.ProjectId,
        r.Name,
        r.Location,
        r.Type.ToString(),
        r.Description,
        r.SortOrder,
        r.EnvironmentId,
        r.Environment?.Name,
        r.CreatedUtc,
        r.UpdatedUtc,
        r.Tags.Select(TagResponse.FromEntity).ToArray());
}
