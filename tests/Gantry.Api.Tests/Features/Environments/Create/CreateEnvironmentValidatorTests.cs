using Gantry.Api.Features.Environments.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Environments.Create;

[Trait("Category", "Unit")]
public class CreateEnvironmentValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Name_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Name_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, new string('x', 101), null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void BaseUrl_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Name", new string('x', 501)));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "BaseUrl");
    }

    [Fact]
    public void Valid_Request_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Prod", "https://example.com"));

        result.IsValid.ShouldBeTrue();
    }
}
