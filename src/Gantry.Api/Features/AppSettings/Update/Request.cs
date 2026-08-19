namespace Gantry.Api.Features.AppSettings.Update;

public record Request(string? DisplayName, string? Email, bool? LockEnabled, int? IdleTimeoutMinutes);
