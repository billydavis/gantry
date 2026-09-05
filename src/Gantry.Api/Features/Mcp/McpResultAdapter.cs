using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ModelContextProtocol;

namespace Gantry.Api.Features.Mcp;

/// <summary>
/// Translates the IResult returned by an existing REST Endpoint.Handle method into either a
/// value the MCP tool can return, or an McpException the SDK surfaces as an IsError tool result.
/// Every MCP tool method funnels its Handle call through here so REST and MCP share one error story.
/// </summary>
public static class McpResultAdapter
{
    public static T Unwrap<T>(IResult result)
    {
        CheckForErrors(result);

        if (result is IValueHttpResult { Value: T value })
            return value;

        throw new InvalidOperationException($"Unexpected MCP result shape: {result.GetType().Name}");
    }

    /// <summary>
    /// Like Unwrap&lt;T&gt;, but a bare Results.NoContent() (no error, just "nothing here") maps to null
    /// instead of throwing — e.g. Quotes/GetToday when no quote could be fetched for today.
    /// </summary>
    public static T? UnwrapOptional<T>(IResult result)
    {
        CheckForErrors(result);

        if (result is IStatusCodeHttpResult { StatusCode: StatusCodes.Status204NoContent })
            return default;

        if (result is IValueHttpResult { Value: T value })
            return value;

        throw new InvalidOperationException($"Unexpected MCP result shape: {result.GetType().Name}");
    }

    public static string UnwrapNoContent(IResult result)
    {
        CheckForErrors(result);
        return "Done.";
    }

    private static void CheckForErrors(IResult result)
    {
        if (result is IValueHttpResult { Value: HttpValidationProblemDetails problem })
        {
            var messages = problem.Errors.SelectMany(e => e.Value.Select(m => $"{e.Key}: {m}"));
            throw new McpToolValidationException(string.Join("; ", messages));
        }

        if (result is not IStatusCodeHttpResult { StatusCode: >= 400 } statusResult)
            return;

        var message = ExtractMessage(result) ?? DefaultMessage(statusResult.StatusCode!.Value);

        if (statusResult.StatusCode == StatusCodes.Status404NotFound)
            throw new McpException(message);

        throw new McpToolValidationException(message);
    }

    /// <summary>
    /// Pulls a human-readable sentence out of the result's value, if it has one worth showing.
    /// A bare string is used as-is; an anonymous/POCO error body is checked for a "title", "error",
    /// or "message" string property (the shapes used across our endpoints). Anything else falls
    /// through to the status-code default rather than dumping raw JSON at the caller.
    /// </summary>
    private static string? ExtractMessage(IResult result)
    {
        if (result is not IValueHttpResult { Value: not null } valueResult)
            return null;

        if (valueResult.Value is string s)
            return s;

        var element = JsonSerializer.SerializeToElement(valueResult.Value);
        if (element.ValueKind != JsonValueKind.Object)
            return null;

        foreach (var propertyName in new[] { "title", "error", "message" })
        {
            if (element.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String)
                return prop.GetString();
        }

        return null;
    }

    private static string DefaultMessage(int statusCode) => statusCode switch
    {
        StatusCodes.Status404NotFound => "The requested resource was not found.",
        StatusCodes.Status409Conflict => "The request could not be completed due to a conflict.",
        _ => "The request was invalid."
    };
}
