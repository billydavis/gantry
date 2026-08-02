namespace Gantry.Api.Infrastructure.Maintenance;

public class MaintenanceModeState
{
    private volatile bool _active;
    private string? _reason;

    public bool IsActive => _active;
    public string? Reason => _reason;

    public void Begin(string reason)
    {
        _reason = reason;
        _active = true;
    }

    public void End()
    {
        _active = false;
        _reason = null;
    }
}
