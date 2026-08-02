namespace Gantry.Api.Features.Admin.Backups.Download;

public static class Endpoint
{
    public static async Task<IResult> Handle(Guid id, BackupStore store)
    {
        var metadata = await store.TryGetAsync(id);
        if (metadata is null)
            return Results.NotFound();

        var path = store.GetDumpPath(metadata);
        if (!File.Exists(path))
            return Results.NotFound();

        return Results.File(path, "application/octet-stream", fileDownloadName: metadata.FileName);
    }
}
