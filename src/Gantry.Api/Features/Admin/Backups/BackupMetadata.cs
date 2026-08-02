namespace Gantry.Api.Features.Admin.Backups;

public record BackupMetadata(
    Guid Id,
    string FileName,
    string? Label,
    long SizeBytes,
    string? MigrationVersion,
    string Source,
    DateTime CreatedUtc);
