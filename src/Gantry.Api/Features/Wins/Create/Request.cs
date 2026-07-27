namespace Gantry.Api.Features.Wins.Create;

public record Request(
    string Title,
    string? Description,
    string? Impact,
    DateOnly Date,
    Guid? ProjectId);
