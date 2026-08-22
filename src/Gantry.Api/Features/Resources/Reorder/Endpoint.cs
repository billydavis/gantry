using Gantry.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Features.Resources.Reorder;

public record ReorderItem(Guid Id, int SortOrder);

public static class Endpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPut("/api/resources/reorder", Handle).WithName("ReorderResources");

    internal static async Task<IResult> Handle(
        List<ReorderItem> items,
        AppDbContext db,
        CancellationToken ct)
    {
        if (items.Count == 0)
            return Results.NoContent();

        var ids = items.Select(i => i.Id).ToList();
        var resources = await db.Resources.Where(r => ids.Contains(r.Id)).ToListAsync(ct);

        foreach (var resource in resources)
        {
            var item = items.FirstOrDefault(i => i.Id == resource.Id);
            if (item is not null)
            {
                resource.SortOrder = item.SortOrder;
                resource.UpdatedUtc = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }
}
