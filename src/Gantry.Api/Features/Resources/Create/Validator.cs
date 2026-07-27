using FluentValidation;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Resources.Create;

public class Validator : AbstractValidator<Request>
{
    public Validator()
    {
        // ProjectId is optional — null means a global/dashboard resource
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Type).NotEmpty()
            .Must(t => Enum.TryParse<ResourceType>(t, out _))
            .WithMessage("Invalid resource type.");
    }
}
