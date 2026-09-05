using Gantry.Api.Features.Wins.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.Create;

[Trait("Category", "Unit")]
public class CreateWinValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request("", null, null, DateOnly.FromDateTime(DateTime.UtcNow), null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Impact_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request("Title", null, new string('x', 1001), DateOnly.FromDateTime(DateTime.UtcNow), null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Impact");
    }

    [Fact]
    public void Valid_IsValid()
    {
        var result = _sut.Validate(new Request("Title", "Description", "Impact", DateOnly.FromDateTime(DateTime.UtcNow), null));

        result.IsValid.ShouldBeTrue();
    }
}
