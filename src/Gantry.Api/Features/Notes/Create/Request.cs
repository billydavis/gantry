namespace Gantry.Api.Features.Notes.Create;

public record CreateNoteRequest(Guid? ProjectId, string? Title, string Content);
