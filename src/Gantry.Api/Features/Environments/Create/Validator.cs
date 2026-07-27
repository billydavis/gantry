using FluentValidation;

namespace Gantry.Api.Features.Environments.Create;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BaseUrl).MaximumLength(500).When(x => x.BaseUrl is not null);
    }
}
