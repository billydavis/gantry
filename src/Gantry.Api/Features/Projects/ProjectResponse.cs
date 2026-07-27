using System.Text.Json;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Tags;

namespace Gantry.Api.Features.Projects;

public record ProjectResponse(
    Guid Id,
    Guid? ParentProjectId,
    string Name,
    string? Description,
    string Status,
    string? Color,
    JsonElement? Settings,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    TagResponse[] Tags)
{
    public static ProjectResponse FromEntity(Project p) => new(
        p.Id,
        p.ParentProjectId,
        p.Name,
        p.Description,
        p.Status.ToString(),
        p.Color,
        p.Settings is not null ? JsonSerializer.Deserialize<JsonElement>(p.Settings) : null,
        p.CreatedUtc,
        p.UpdatedUtc,
        p.Tags.Select(TagResponse.FromEntity).ToArray());
}
