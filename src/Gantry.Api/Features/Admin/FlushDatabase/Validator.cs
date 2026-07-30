using FluentValidation;

namespace Gantry.Api.Features.Admin.FlushDatabase;

public class Validator : AbstractValidator<Request>
{
    public const string RequiredPhrase = "DELETE ALL DATA";

    public Validator()
    {
        RuleFor(x => x.Confirmation).Equal(RequiredPhrase)
            .WithMessage($"Confirmation phrase must exactly match \"{RequiredPhrase}\".");
    }
}
