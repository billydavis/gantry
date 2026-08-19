using FluentValidation;

namespace Gantry.Api.Features.AppSettings.ChangePin;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.CurrentPin).NotEmpty().WithMessage("Current PIN is required.");
        RuleFor(x => x.NewPin)
            .Matches("^[0-9]{4,8}$").WithMessage("PIN must be 4-8 digits.");
    }
}
