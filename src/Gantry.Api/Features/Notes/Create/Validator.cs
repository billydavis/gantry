using FluentValidation;

namespace Gantry.Api.Features.Notes.Create;

public class Validator : AbstractValidator<CreateNoteRequest>
{
    public Validator()
    {
        RuleFor(x => x.Title).MaximumLength(500).When(x => x.Title is not null);
        RuleFor(x => x.Content).MaximumLength(200000);
    }
}
