namespace Gantry.Api.Data.Entities;

public class DailyQuote
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public string Quote { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedUtc { get; set; }
}
