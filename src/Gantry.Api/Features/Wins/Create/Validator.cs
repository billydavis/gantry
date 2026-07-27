using FluentValidation;

namespace Gantry.Api.Features.Wins.Create;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Impact).MaximumLength(1000).When(x => x.Impact is not null);
    }
}
