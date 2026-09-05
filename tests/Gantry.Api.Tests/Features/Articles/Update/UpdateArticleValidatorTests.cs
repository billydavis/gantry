using Gantry.Api.Features.Articles.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Articles.Update;

[Trait("Category", "Unit")]
public class UpdateArticleValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_Empty_IsInvalid()
    {
        var result = _sut.Validate(new UpdateArticleRequest("", "Content", null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Valid_IsValid()
    {
        var result = _sut.Validate(new UpdateArticleRequest("Title", "Content", null, null));

        result.IsValid.ShouldBeTrue();
    }
}
