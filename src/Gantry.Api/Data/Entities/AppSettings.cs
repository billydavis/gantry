namespace Gantry.Api.Data.Entities;

public class AppSettings
{
    public Guid Id { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public DateTime UpdatedUtc { get; set; }
    public bool LockEnabled { get; set; } = true;
    public int IdleTimeoutMinutes { get; set; } = 5;
    public string? PinHash { get; set; }
    public string? PinSalt { get; set; }
}
