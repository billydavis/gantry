using Gantry.Api.Features.Tags.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Tags.Update;

[Trait("Category", "Unit")]
public class UpdateTagValidatorTests
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
    public void Valid_Request_IsValid()
    {
        var result = _sut.Validate(new Request("bug", "#ff6b6b"));

        result.IsValid.ShouldBeTrue();
    }
}
