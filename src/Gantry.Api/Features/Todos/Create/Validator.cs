using FluentValidation;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Todos.Create;

public class Validator : AbstractValidator<Request>
{
    private static readonly string[] ValidPriorities = Enum.GetNames<Priority>();

    public Validator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(500).WithMessage("Title must not exceed 500 characters.");

        RuleFor(x => x.Priority)
            .Must(p => p is null || ValidPriorities.Contains(p, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Priority must be one of: {string.Join(", ", ValidPriorities)}.");

        RuleFor(x => x.EstimatedMinutes)
            .GreaterThan(0).When(x => x.EstimatedMinutes.HasValue)
            .WithMessage("Estimated minutes must be greater than zero.");
    }
}
