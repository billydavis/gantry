using System.Text.Json;

namespace Gantry.Api.Features.Projects.Create;

public record Request(
    Guid? ParentProjectId,
    string Name,
    string? Description,
    string? Color,
    JsonElement? Settings);
