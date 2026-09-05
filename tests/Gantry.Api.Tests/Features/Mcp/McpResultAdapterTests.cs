using Gantry.Api.Features.Mcp;
using Microsoft.AspNetCore.Http;
using ModelContextProtocol;
using Shouldly;
using Xunit;

namespace Gantry.Api.Tests.Features.Mcp;

[Trait("Category", "Unit")]
public class McpResultAdapterTests
{
    [Fact]
    public void Unwrap_OkResult_ReturnsValue()
        => McpResultAdapter.Unwrap<string>(Results.Ok("hi")).ShouldBe("hi");

    [Fact]
    public void Unwrap_NotFoundWithStringBody_ThrowsMcpExceptionWithThatMessage()
    {
        var ex = Should.Throw<McpException>(() => McpResultAdapter.Unwrap<object>(Results.NotFound("Todo not found.")));
        ex.Message.ShouldBe("Todo not found.");
    }

    [Fact]
    public void Unwrap_BareNotFound_ThrowsMcpExceptionWithDefaultMessage()
    {
        var ex = Should.Throw<McpException>(() => McpResultAdapter.Unwrap<object>(Results.NotFound()));
        ex.Message.ShouldBe("The requested resource was not found.");
    }

    [Fact]
    public void Unwrap_ConflictWithTitleProperty_ThrowsMcpToolValidationExceptionWithTitle()
    {
        var ex = Should.Throw<McpToolValidationException>(() =>
            McpResultAdapter.Unwrap<object>(Results.Conflict(new { title = "Already archived." })));
        ex.Message.ShouldBe("Already archived.");
    }

    [Fact]
    public void Unwrap_ConflictWithUnrecognizedBody_FallsBackToDefaultMessage()
    {
        var ex = Should.Throw<McpToolValidationException>(() =>
            McpResultAdapter.Unwrap<object>(Results.Conflict(new { somethingElse = "irrelevant" })));
        ex.Message.ShouldBe("The request could not be completed due to a conflict.");
    }

    [Fact]
    public void Unwrap_ValidationProblem_JoinsFieldMessages()
    {
        var ex = Should.Throw<McpToolValidationException>(() => McpResultAdapter.Unwrap<object>(
            Results.ValidationProblem(new Dictionary<string, string[]> { ["Title"] = ["Title is required."] })));
        ex.Message.ShouldBe("Title: Title is required.");
    }

    [Fact]
    public void UnwrapOptional_NoContent_ReturnsDefault()
        => McpResultAdapter.UnwrapOptional<string>(Results.NoContent()).ShouldBeNull();

    [Fact]
    public void UnwrapNoContent_Success_ReturnsDone()
        => McpResultAdapter.UnwrapNoContent(Results.NoContent()).ShouldBe("Done.");

    [Fact]
    public void UnwrapNoContent_NotFound_ThrowsMcpException()
        => Should.Throw<McpException>(() => McpResultAdapter.UnwrapNoContent(Results.NotFound("Project not found.")));
}
