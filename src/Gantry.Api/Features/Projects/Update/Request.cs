using System.Text.Json;

namespace Gantry.Api.Features.Projects.Update;

public record Request(
    Guid? ParentProjectId,
    string Name,
    string? Description,
    string? Color,
    JsonElement? Settings);
