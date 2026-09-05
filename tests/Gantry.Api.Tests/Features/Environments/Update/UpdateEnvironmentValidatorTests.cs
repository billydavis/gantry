using Gantry.Api.Features.Environments.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Environments.Update;

[Trait("Category", "Unit")]
public class UpdateEnvironmentValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Name_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request("", null, 0));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Valid_Request_IsValid()
    {
        var result = _sut.Validate(new Request("Prod", "https://example.com", 1));

        result.IsValid.ShouldBeTrue();
    }
}
