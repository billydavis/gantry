using Gantry.Api.Features.Todos.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos.Create;

[Trait("Category", "Unit")]
public class CreateTodoValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_Empty_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "", null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Title_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, new string('x', 501), null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Title_Valid_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Write tests", null, null, null, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData("High")]
    [InlineData("medium")]
    [InlineData("LOW")]
    public void Priority_KnownNameCaseInsensitive_IsValid(string priority)
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, priority, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Priority_Unknown_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, "NotAPriority", null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Priority");
    }

    [Fact]
    public void EstimatedMinutes_Zero_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, 0, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "EstimatedMinutes");
    }

    [Fact]
    public void EstimatedMinutes_Positive_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, 30, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Link_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, new string('x', 2001), null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Link");
    }
}
