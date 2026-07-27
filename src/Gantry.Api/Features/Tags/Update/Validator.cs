using FluentValidation;

namespace Gantry.Api.Features.Tags.Update;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Color).Matches("^#[0-9a-fA-F]{6}$").When(x => x.Color is not null)
            .WithMessage("Color must be a hex color (e.g. #4dabf7)");
    }
}
