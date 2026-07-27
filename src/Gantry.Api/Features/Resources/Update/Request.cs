namespace Gantry.Api.Features.Resources.Update;

public record Request(
    string Name,
    string Location,
    string Type,
    string? Description,
    int SortOrder,
    Guid? EnvironmentId = null);
