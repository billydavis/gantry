using FluentValidation;

namespace Gantry.Api.Features.Admin.Backups.Restore;

public class Validator : AbstractValidator<Request>
{
    public const string RequiredPhrase = "RESTORE DATABASE";

    public Validator()
    {
        RuleFor(x => x.Confirmation).Equal(RequiredPhrase)
            .WithMessage($"Confirmation phrase must exactly match \"{RequiredPhrase}\".");
    }
}
