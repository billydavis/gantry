namespace Gantry.Api.Features.Environments.Update;

public record Request(string Name, string? BaseUrl, int SortOrder);
