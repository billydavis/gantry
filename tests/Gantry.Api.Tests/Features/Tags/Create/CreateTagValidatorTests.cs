using Gantry.Api.Features.Tags.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Create;

[Trait("Category", "Unit")]
public class CreateTagValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Name_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request("", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Color_InvalidHex_IsInvalidWithMessage()
    {
        var result = _sut.Validate(new Request("bug", "notahex"));

        result.IsValid.ShouldBeFalse();
        var error = result.Errors.ShouldHaveSingleItem();
        error.PropertyName.ShouldBe("Color");
        error.ErrorMessage.ShouldBe("Color must be a hex color (e.g. #4dabf7)");
    }

    [Fact]
    public void Color_ValidHex_IsValid()
    {
        var result = _sut.Validate(new Request("bug", "#4dabf7"));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Color_Null_IsValid()
    {
        var result = _sut.Validate(new Request("bug", null));

        result.IsValid.ShouldBeTrue();
    }
}
