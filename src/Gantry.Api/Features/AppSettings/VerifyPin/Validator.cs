using FluentValidation;

namespace Gantry.Api.Features.AppSettings.VerifyPin;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.Pin).NotEmpty().WithMessage("PIN is required.");
    }
}
