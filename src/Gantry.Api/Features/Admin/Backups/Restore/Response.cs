namespace Gantry.Api.Features.Admin.Backups.Restore;

public record Response(string? RestoredMigrationVersion, string? CurrentMigrationVersion);
