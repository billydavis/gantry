using Entities = Gantry.Api.Data.Entities;

namespace Gantry.Api.Features.Quotes;

public record QuoteResponse(string Quote, string Author, DateOnly Date)
{
    public static QuoteResponse FromEntity(Entities.DailyQuote q) => new(q.Quote, q.Author, q.Date);
}
