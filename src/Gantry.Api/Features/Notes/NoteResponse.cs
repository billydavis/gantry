using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Tags;

namespace Gantry.Api.Features.Notes;

public record NoteResponse(
    Guid Id,
    Guid? ProjectId,
    string? ProjectName,
    string? Title,
    DateOnly? Date,
    string Content,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    TagResponse[] Tags)
{
    public static NoteResponse FromEntity(Note n) => new(
        n.Id, n.ProjectId, n.Project?.Name, n.Title, n.Date,
        n.Content, n.CreatedUtc, n.UpdatedUtc,
        n.Tags.Select(TagResponse.FromEntity).ToArray());
}
