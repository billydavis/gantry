using FluentValidation;

namespace Gantry.Api.Features.AppSettings.Update;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.DisplayName)
            .MaximumLength(100).WithMessage("Display name must not exceed 100 characters.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Enter a valid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .MaximumLength(320).WithMessage("Email must not exceed 320 characters.");

        RuleFor(x => x.IdleTimeoutMinutes)
            .InclusiveBetween(1, 120).WithMessage("Idle timeout must be between 1 and 120 minutes.")
            .When(x => x.IdleTimeoutMinutes is not null);
    }
}
