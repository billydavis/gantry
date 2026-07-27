using FluentValidation;

namespace Gantry.Api.Features.Notes.Update;

public class Validator : AbstractValidator<UpdateNoteRequest>
{
    public Validator()
    {
        RuleFor(x => x.Title).MaximumLength(500).When(x => x.Title is not null);
        RuleFor(x => x.Content).MaximumLength(200000);
    }
}
