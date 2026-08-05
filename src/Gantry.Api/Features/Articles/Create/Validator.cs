using FluentValidation;

namespace Gantry.Api.Features.Articles.Create;

public class Validator : AbstractValidator<CreateArticleRequest>
{
    public Validator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Content).MaximumLength(200000);
        RuleFor(x => x.Category).MaximumLength(100).When(x => x.Category is not null);
        RuleFor(x => x.SourceUrl).MaximumLength(2000)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("SourceUrl must be a valid absolute URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.SourceUrl));
    }
}
