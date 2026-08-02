namespace Gantry.Api.Features.Admin.Backups.Upload;

public static class Endpoint
{
    public static async Task<IResult> Handle(HttpRequest request, BackupStore store, CancellationToken ct)
    {
        if (!request.HasFormContentType)
            return Results.BadRequest("Expected multipart/form-data.");

        var form = await request.ReadFormAsync(ct);
        var file = form.Files["file"];
        if (file is null || file.Length == 0)
            return Results.BadRequest("A non-empty .dump file is required.");

        if (!file.FileName.EndsWith(".dump", StringComparison.OrdinalIgnoreCase))
            return Results.BadRequest("Only .dump files are supported.");

        var label = form["label"].ToString();

        store.EnsureDirectoryExists();

        var id = Guid.NewGuid();
        var fileName = $"{DateTime.UtcNow:yyyyMMdd-HHmmss}-uploaded.dump";
        var path = Path.Combine(store.Directory, fileName);

        await using (var stream = File.Create(path))
        {
            await file.CopyToAsync(stream, ct);
        }

        var metadata = new BackupMetadata(
            id, fileName, string.IsNullOrWhiteSpace(label) ? null : label, file.Length, null, "uploaded", DateTime.UtcNow);
        await store.SaveAsync(metadata);

        return Results.Created($"/api/admin/backups/{id}", metadata);
    }
}
