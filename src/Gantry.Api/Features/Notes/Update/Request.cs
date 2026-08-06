namespace Gantry.Api.Features.Notes.Update;

public record UpdateNoteRequest(Guid? ProjectId, string? Title, string Content);
