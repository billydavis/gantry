namespace Gantry.Api.Features.Resources.Create;

public record Request(
    Guid? ProjectId,
    string Name,
    string Location,
    string Type,
    string? Description,
    Guid? EnvironmentId = null,
    int SortOrder = 0);
