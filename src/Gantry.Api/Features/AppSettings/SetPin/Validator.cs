using FluentValidation;

namespace Gantry.Api.Features.AppSettings.SetPin;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.Pin)
            .Matches("^[0-9]{4,8}$").WithMessage("PIN must be 4-8 digits.");
    }
}
