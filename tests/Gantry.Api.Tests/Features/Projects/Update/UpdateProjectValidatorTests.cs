using Gantry.Api.Features.Projects.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Projects.Update;

[Trait("Category", "Unit")]
public class UpdateProjectValidatorTests
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
    public void Name_Valid_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Renamed", null, null, null));

        result.IsValid.ShouldBeTrue();
    }
}
