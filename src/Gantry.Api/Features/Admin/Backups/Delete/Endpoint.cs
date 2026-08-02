namespace Gantry.Api.Features.Admin.Backups.Delete;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, BackupStore store)
    {
        var metadata = await store.TryGetAsync(id);
        if (metadata is null)
            return Results.NotFound();

        store.Delete(metadata);
        return Results.NoContent();
    }
}
