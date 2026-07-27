using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Tags;

public record TagResponse(Guid Id, string Name, string? Color)
{
    public static TagResponse FromEntity(Tag t) => new(t.Id, t.Name, t.Color);
}
