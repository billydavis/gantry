using FluentValidation;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Todos.Update;

public class Validator : AbstractValidator<Request>
{
    private static readonly string[] ValidStatuses = Enum.GetNames<TodoStatus>();
    private static readonly string[] ValidPriorities = Enum.GetNames<Priority>();
    private static readonly string[] ValidRecurrenceTypes = Enum.GetNames<RecurrenceType>();

    public Validator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(500).WithMessage("Title must not exceed 500 characters.");

        RuleFor(x => x.Link)
            .MaximumLength(2000).WithMessage("Link must not exceed 2000 characters.");

        RuleFor(x => x.Status)
            .Must(s => s is null || ValidStatuses.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of: {string.Join(", ", ValidStatuses)}.");

        RuleFor(x => x.Priority)
            .Must(p => p is null || ValidPriorities.Contains(p, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Priority must be one of: {string.Join(", ", ValidPriorities)}.");

        RuleFor(x => x.EstimatedMinutes)
            .GreaterThan(0).When(x => x.EstimatedMinutes.HasValue)
            .WithMessage("Estimated minutes must be greater than zero.");

        RuleFor(x => x.RecurrenceType)
            .Must(r => r is null || ValidRecurrenceTypes.Contains(r, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"RecurrenceType must be one of: {string.Join(", ", ValidRecurrenceTypes)}.");

        RuleFor(x => x.RecurrenceIntervalDays)
            .Must(v => v.HasValue && v.Value > 0)
            .When(x => IsCustom(x.RecurrenceType))
            .WithMessage("RecurrenceIntervalDays must be greater than zero when RecurrenceType is Custom.");

        RuleFor(x => x.RecurrenceIntervalDays)
            .Null()
            .When(x => !IsCustom(x.RecurrenceType))
            .WithMessage("RecurrenceIntervalDays may only be set when RecurrenceType is Custom.");

        RuleFor(x => x.DueDate)
            .NotNull()
            .When(x => IsRecurring(x.RecurrenceType))
            .WithMessage("DueDate is required when RecurrenceType is set.");
    }

    private static bool IsRecurring(string? recurrenceType) =>
        recurrenceType is not null && !string.Equals(recurrenceType, nameof(RecurrenceType.None), StringComparison.OrdinalIgnoreCase);

    private static bool IsCustom(string? recurrenceType) =>
        recurrenceType is not null && string.Equals(recurrenceType, nameof(RecurrenceType.Custom), StringComparison.OrdinalIgnoreCase);
}
