namespace Gantry.Api.Data.Entities;

public class AppSettings
{
    public Guid Id { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public DateTime UpdatedUtc { get; set; }
}
