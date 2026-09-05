using Gantry.Api.Features.Wins.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Wins.Update;

[Trait("Category", "Unit")]
public class UpdateWinValidatorTests
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
    public void Valid_IsValid()
    {
        var result = _sut.Validate(new Request("Title", null, null, DateOnly.FromDateTime(DateTime.UtcNow), null));

        result.IsValid.ShouldBeTrue();
    }
}
