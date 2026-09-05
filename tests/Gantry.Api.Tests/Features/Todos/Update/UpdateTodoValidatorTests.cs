using Gantry.Api.Features.Todos.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Update;

[Trait("Category", "Unit")]
public class UpdateTodoValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "", null, null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Theory]
    [InlineData("Todo")]
    [InlineData("inprogress")]
    [InlineData("COMPLETE")]
    public void Status_KnownNameCaseInsensitive_IsValid(string status)
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, status, null, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Status_Unknown_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, "NotAStatus", null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Status");
    }

    [Fact]
    public void EstimatedMinutes_Zero_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, 0, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "EstimatedMinutes");
    }
}
