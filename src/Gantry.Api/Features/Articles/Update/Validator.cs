using FluentValidation;

namespace Gantry.Api.Features.Articles.Update;

public class Validator : AbstractValidator<UpdateArticleRequest>
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
