using FluentValidation;

namespace Gantry.Api.Features.AppSettings.ClearPin;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.CurrentPin).NotEmpty().WithMessage("Current PIN is required.");
    }
}
