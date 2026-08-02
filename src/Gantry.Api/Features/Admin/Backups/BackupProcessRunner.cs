using System.Diagnostics;
using Npgsql;

namespace Gantry.Api.Features.Admin.Backups;

public record BackupProcessResult(bool Success, string StdOut, string StdErr, int ExitCode);

public class BackupProcessRunner(IConfiguration configuration)
{
    private readonly NpgsqlConnectionStringBuilder _connectionInfo =
        new(configuration.GetConnectionString("DefaultConnection"));

    public Task<BackupProcessResult> DumpAsync(string outputFilePath, CancellationToken ct = default) =>
        RunAsync("pg_dump", $"-Fc -h {_connectionInfo.Host} -p {_connectionInfo.Port} -U {_connectionInfo.Username} " +
                             $"-d {_connectionInfo.Database} -f \"{outputFilePath}\"", ct);

    public Task<BackupProcessResult> RestoreAsync(string inputFilePath, CancellationToken ct = default) =>
        RunAsync("pg_restore", $"--clean --if-exists -h {_connectionInfo.Host} -p {_connectionInfo.Port} " +
                                $"-U {_connectionInfo.Username} -d {_connectionInfo.Database} \"{inputFilePath}\"", ct);

    private async Task<BackupProcessResult> RunAsync(string fileName, string arguments, CancellationToken ct)
    {
        var startInfo = new ProcessStartInfo(fileName, arguments)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        startInfo.Environment["PGPASSWORD"] = _connectionInfo.Password;

        using var process = Process.Start(startInfo)
            ?? throw new InvalidOperationException($"Failed to start {fileName}.");

        var stdOutTask = process.StandardOutput.ReadToEndAsync(ct);
        var stdErrTask = process.StandardError.ReadToEndAsync(ct);
        await process.WaitForExitAsync(ct);

        var stdOut = await stdOutTask;
        var stdErr = await stdErrTask;

        return new BackupProcessResult(process.ExitCode == 0, stdOut, stdErr, process.ExitCode);
    }
}
