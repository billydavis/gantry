using ModelContextProtocol;

namespace Gantry.Api.Features.Mcp;

public class McpToolValidationException(string message) : McpException(message);
