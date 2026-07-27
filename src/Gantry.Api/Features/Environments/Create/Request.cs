namespace Gantry.Api.Features.Environments.Create;

public record Request(
    Guid? ProjectId,
    string Name,
    string? BaseUrl,
    int SortOrder = 0);
