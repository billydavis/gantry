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
        var result = _sut.Validate(new Request(null, "", null, null, null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Title_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, new string('x', 501), null, null, null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Title_Valid_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Write tests", null, null, null, null, null, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData("High")]
    [InlineData("medium")]
    [InlineData("LOW")]
    public void Priority_KnownNameCaseInsensitive_IsValid(string priority)
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, priority, null, null, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Priority_Unknown_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, "NotAPriority", null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Priority");
    }

    [Fact]
    public void EstimatedMinutes_Zero_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, 0, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "EstimatedMinutes");
    }

    [Fact]
    public void EstimatedMinutes_Positive_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, 30, null, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Link_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, new string('x', 2001), null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Link");
    }

    [Fact]
    public void RecurrenceType_Unknown_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "NotAType", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "RecurrenceType");
    }

    [Theory]
    [InlineData("Daily")]
    [InlineData("weekly")]
    [InlineData("MONTHLY")]
    public void RecurrenceType_KnownNameWithDueDate_IsValid(string recurrenceType)
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, DateOnly.FromDateTime(DateTime.Today), recurrenceType, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void RecurrenceType_Custom_WithoutIntervalDays_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "Custom", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "RecurrenceIntervalDays");
    }

    [Fact]
    public void RecurrenceType_Custom_WithPositiveIntervalDays_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "Custom", 10));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void RecurrenceIntervalDays_SetWithoutCustomType_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "Daily", 5));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "RecurrenceIntervalDays");
    }

    [Fact]
    public void RecurrenceType_SetWithoutDueDate_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, "Weekly", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "DueDate");
    }

    [Fact]
    public void RecurrenceType_None_WithoutDueDate_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, "None", null));

        result.IsValid.ShouldBeTrue();
    }
}
