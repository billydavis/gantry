using Gantry.Api.Features.Resources.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Resources.Update;

[Trait("Category", "Unit")]
public class UpdateResourceValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Name_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request("", "https://example.com", "Website", null, 0));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Type_Invalid_IsInvalidWithMessage()
    {
        var result = _sut.Validate(new Request("Name", "https://example.com", "NotAType", null, 0));

        result.IsValid.ShouldBeFalse();
        var error = result.Errors.ShouldHaveSingleItem();
        error.PropertyName.ShouldBe("Type");
        error.ErrorMessage.ShouldBe("Invalid resource type.");
    }

    [Fact]
    public void Valid_Request_IsValid()
    {
        var result = _sut.Validate(new Request("Name", "https://example.com", "Website", null, 0));

        result.IsValid.ShouldBeTrue();
    }
}
