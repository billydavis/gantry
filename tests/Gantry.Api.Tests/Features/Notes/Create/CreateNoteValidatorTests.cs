using Gantry.Api.Features.Notes.Create;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Notes.Create;

[Trait("Category", "Unit")]
public class CreateNoteValidatorTests
{
    private readonly Validator _sut = new();

    [Fact]
    public void Title_Null_IsValid()
    {
        var result = _sut.Validate(new CreateNoteRequest(null, null, "Content"));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Title_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new CreateNoteRequest(null, new string('x', 501), "Content"));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Content_TooLong_IsInvalid()
    {
        var result = _sut.Validate(new CreateNoteRequest(null, "Title", new string('x', 200001)));

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == "Content");
    }

    [Fact]
    public void Valid_IsValid()
    {
        var result = _sut.Validate(new CreateNoteRequest(null, "Title", "Content"));

        result.IsValid.ShouldBeTrue();
    }
}
