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
        var result = _sut.Validate(new Request(null, "", null, null, null, null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Theory]
    [InlineData("Todo")]
    [InlineData("inprogress")]
    [InlineData("COMPLETE")]
    public void Status_KnownNameCaseInsensitive_IsValid(string status)
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, status, null, null, null, null, null));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Status_Unknown_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, "NotAStatus", null, null, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Status");
    }

    [Fact]
    public void EstimatedMinutes_Zero_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, 0, null, null, null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "EstimatedMinutes");
    }

    [Fact]
    public void RecurrenceType_Unknown_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "NotAType", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "RecurrenceType");
    }

    [Fact]
    public void RecurrenceType_Custom_WithoutIntervalDays_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "Custom", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "RecurrenceIntervalDays");
    }

    [Fact]
    public void RecurrenceType_Custom_WithPositiveIntervalDays_IsValid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "Custom", 10));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void RecurrenceIntervalDays_SetWithoutCustomType_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, DateOnly.FromDateTime(DateTime.Today), "Weekly", 5));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "RecurrenceIntervalDays");
    }

    [Fact]
    public void RecurrenceType_SetWithoutDueDate_IsInvalid()
    {
        var result = _sut.Validate(new Request(null, "Title", null, null, null, null, null, null, "Weekly", null));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "DueDate");
    }
}
