namespace Gantry.Api.Features.Admin.Backups.List;

public record Response(string? CurrentMigrationVersion, List<BackupMetadata> Backups);
