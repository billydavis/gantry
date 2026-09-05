using Gantry.Api.Features.Articles.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.Create;

[Trait("Category", "Unit")]
public class CreateArticleValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_Empty_IsInvalid()
    {
        var result = _sut.Validate(new CreateArticleRequest("", "Content", null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void SourceUrl_NotAbsolute_IsInvalid()
    {
        var result = _sut.Validate(new CreateArticleRequest("Title", "Content", null, "not-a-url"));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "SourceUrl");
    }

    [Fact]
    public void SourceUrl_ValidAbsoluteUrl_IsValid()
    {
        var result = _sut.Validate(new CreateArticleRequest("Title", "Content", null, "https://example.com"));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void SourceUrl_Null_IsValid()
    {
        var result = _sut.Validate(new CreateArticleRequest("Title", "Content", null, null));

        result.IsValid.ShouldBeTrue();
    }
}
