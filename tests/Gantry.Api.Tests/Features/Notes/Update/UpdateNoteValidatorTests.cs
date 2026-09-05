using Gantry.Api.Features.Notes.Update;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.Update;

[Trait("Category", "Unit")]
public class UpdateNoteValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new UpdateNoteRequest(null, new string('x', 501), "Content"));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Content_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new UpdateNoteRequest(null, "Title", new string('x', 200001)));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Content");
    }

    [Fact]
    public void Valid_IsValid()
    {
        var result = _sut.Validate(new UpdateNoteRequest(null, "Title", "Content"));

        result.IsValid.ShouldBeTrue();
    }
}
