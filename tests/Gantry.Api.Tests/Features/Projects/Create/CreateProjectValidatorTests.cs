using Gantry.Api.Features.Projects.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Create;

[Trait("Category", "Unit")]
public class CreateProjectValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Name_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "", null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Name_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, new string('x', 201), null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Name_Valid_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Gantry", null, null, null));

        result.IsValid.ShouldBeTrue();
    }
}
