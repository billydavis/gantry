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

        var message = result is IValueHttpResult { Value: not null } valueResult
            ? valueResult.Value switch
            {
                string s => s,
                var v => JsonSerializer.Serialize(v)
            }
            : "The request failed.";

        if (statusResult.StatusCode == StatusCodes.Status404NotFound)
            throw new McpException(message);

        throw new McpToolValidationException(message);
    }
}
