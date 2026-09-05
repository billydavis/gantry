using Gantry.Api.Features.Resources.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Resources.Create;

[Trait("Category", "Unit")]
public class CreateResourceValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Name_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "", "https://example.com", "Website", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Location_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Name", "", "Website", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Location");
    }

    [Fact]
    public void Type_Invalid_IsInvalidWithMessage()
    {
        var result = _sut.Validate(new Request(null, "Name", "https://example.com", "NotAType", null));

        result.IsValid.ShouldBeFalse();
        var error = result.Errors.ShouldHaveSingleItem();
        error.PropertyName.ShouldBe("Type");
        error.ErrorMessage.ShouldBe("Invalid resource type.");
    }

    [Fact]
    public void Valid_Request_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Name", "https://example.com", "Website", "A description"));

        result.IsValid.ShouldBeTrue();
    }
}
