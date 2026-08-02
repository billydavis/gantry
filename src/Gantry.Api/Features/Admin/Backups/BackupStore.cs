using System.Text.Json;

namespace Gantry.Api.Features.Admin.Backups;

public class BackupStore(IConfiguration configuration)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public string Directory { get; } =
        configuration["Backups:Directory"] ?? Path.Combine(AppContext.BaseDirectory, "backups");

    public string GetDumpPath(BackupMetadata metadata) => Path.Combine(Directory, metadata.FileName);

    public void EnsureDirectoryExists() => System.IO.Directory.CreateDirectory(Directory);

    private string GetMetadataPath(Guid id) => Path.Combine(Directory, $"{id}.json");

    public async Task<List<BackupMetadata>> ListAsync()
    {
        if (!System.IO.Directory.Exists(Directory))
            return [];

        var results = new List<BackupMetadata>();
        foreach (var path in System.IO.Directory.EnumerateFiles(Directory, "*.json"))
        {
            await using var stream = File.OpenRead(path);
            var metadata = await JsonSerializer.DeserializeAsync<BackupMetadata>(stream, JsonOptions);
            if (metadata is not null)
                results.Add(metadata);
        }

        return [.. results.OrderByDescending(b => b.CreatedUtc)];
    }

    public async Task<BackupMetadata?> TryGetAsync(Guid id)
    {
        var path = GetMetadataPath(id);
        if (!File.Exists(path))
            return null;

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<BackupMetadata>(stream, JsonOptions);
    }

    public async Task SaveAsync(BackupMetadata metadata)
    {
        System.IO.Directory.CreateDirectory(Directory);
        await using var stream = File.Create(GetMetadataPath(metadata.Id));
        await JsonSerializer.SerializeAsync(stream, metadata, JsonOptions);
    }

    public void Delete(BackupMetadata metadata)
    {
        var dumpPath = GetDumpPath(metadata);
        if (File.Exists(dumpPath))
            File.Delete(dumpPath);

        var metadataPath = GetMetadataPath(metadata.Id);
        if (File.Exists(metadataPath))
            File.Delete(metadataPath);
    }
}
