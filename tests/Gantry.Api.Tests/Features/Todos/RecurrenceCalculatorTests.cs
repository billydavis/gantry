using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Todos;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Todos;

[Trait("Category", "Unit")]
public class RecurrenceCalculatorTests
{
    [Fact]
    public void CalculateNextDueDate_Daily_AddsOneDay()
    {
        var result = RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 1), RecurrenceType.Daily, null);

        result.ShouldBe(new DateOnly(2026, 1, 2));
    }

    [Fact]
    public void CalculateNextDueDate_Weekly_AddsSevenDays()
    {
        var result = RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 1), RecurrenceType.Weekly, null);

        result.ShouldBe(new DateOnly(2026, 1, 8));
    }

    [Fact]
    public void CalculateNextDueDate_Custom_AddsIntervalDays()
    {
        var result = RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 1), RecurrenceType.Custom, 10);

        result.ShouldBe(new DateOnly(2026, 1, 11));
    }

    [Fact]
    public void CalculateNextDueDate_Monthly_MidMonthDate_KeepsSameDayOfMonth()
    {
        var result = RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 15), RecurrenceType.Monthly, null);

        result.ShouldBe(new DateOnly(2026, 2, 15));
    }

    [Fact]
    public void CalculateNextDueDate_Monthly_FromJan31_LandsOnFeb28()
    {
        var result = RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 31), RecurrenceType.Monthly, null);

        result.ShouldBe(new DateOnly(2026, 2, 28));
    }

    [Fact]
    public void CalculateNextDueDate_Monthly_ChainedThroughShortMonths_StaysAnchoredToMonthEnd()
    {
        // A todo originally due the last day of January should keep landing on the last day of every
        // subsequent month, not drift down to the 28th once it first crosses a short February.
        var due = new DateOnly(2026, 1, 31);

        due = RecurrenceCalculator.CalculateNextDueDate(due, RecurrenceType.Monthly, null);
        due.ShouldBe(new DateOnly(2026, 2, 28));

        due = RecurrenceCalculator.CalculateNextDueDate(due, RecurrenceType.Monthly, null);
        due.ShouldBe(new DateOnly(2026, 3, 31));

        due = RecurrenceCalculator.CalculateNextDueDate(due, RecurrenceType.Monthly, null);
        due.ShouldBe(new DateOnly(2026, 4, 30));

        due = RecurrenceCalculator.CalculateNextDueDate(due, RecurrenceType.Monthly, null);
        due.ShouldBe(new DateOnly(2026, 5, 31));
    }

    [Fact]
    public void CalculateNextDueDate_Monthly_FromLeapFeb29_LandsOnMar31()
    {
        var result = RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2028, 2, 29), RecurrenceType.Monthly, null);

        result.ShouldBe(new DateOnly(2028, 3, 31));
    }

    [Fact]
    public void CalculateNextDueDate_None_Throws()
    {
        Should.Throw<InvalidOperationException>(() =>
            RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 1), RecurrenceType.None, null));
    }

    [Fact]
    public void CalculateNextDueDate_Custom_WithoutIntervalDays_Throws()
    {
        Should.Throw<InvalidOperationException>(() =>
            RecurrenceCalculator.CalculateNextDueDate(new DateOnly(2026, 1, 1), RecurrenceType.Custom, null));
    }

    [Fact]
    public void TrySpawnNextOccurrence_NonRecurring_ReturnsNull()
    {
        var todo = new Todo { DueDate = new DateOnly(2026, 1, 1), RecurrenceType = RecurrenceType.None };

        RecurrenceCalculator.TrySpawnNextOccurrence(todo).ShouldBeNull();
    }

    [Fact]
    public void TrySpawnNextOccurrence_RecurringWithoutDueDate_ReturnsNull()
    {
        var todo = new Todo { DueDate = null, RecurrenceType = RecurrenceType.Weekly };

        RecurrenceCalculator.TrySpawnNextOccurrence(todo).ShouldBeNull();
    }
}
