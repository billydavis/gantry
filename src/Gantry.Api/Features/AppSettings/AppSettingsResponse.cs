using Entities = Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.AppSettings;

public record AppSettingsResponse(
    Guid Id,
    string? DisplayName,
    string? Email,
    DateTime UpdatedUtc,
    bool LockEnabled,
    int IdleTimeoutMinutes,
    bool HasPin)
{
    public static AppSettingsResponse FromEntity(Entities.AppSettings s) => new(
        s.Id, s.DisplayName, s.Email, s.UpdatedUtc, s.LockEnabled, s.IdleTimeoutMinutes, s.PinHash is not null);
}
