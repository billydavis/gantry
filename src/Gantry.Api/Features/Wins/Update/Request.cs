namespace Gantry.Api.Features.Wins.Update;

public record Request(
    string Title,
    string? Description,
    string? Impact,
    DateOnly Date,
    Guid? ProjectId);
