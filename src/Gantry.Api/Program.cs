using Gantry.Api.Data;
using Gantry.Api.Features.Admin;
using Gantry.Api.Features.Admin.Backups;
using Gantry.Api.Features.AppSettings;
using Gantry.Api.Features.Environments;
using Gantry.Api.Features.Notes;
using Gantry.Api.Features.Projects;
using Gantry.Api.Features.Quotes;
using Gantry.Api.Features.Resources;
using Gantry.Api.Features.SampleData;
using Gantry.Api.Features.Search;
using Gantry.Api.Features.Tags;
using Gantry.Api.Features.Timeline;
using Gantry.Api.Features.Todos;
using Gantry.Api.Features.Wins;
using Gantry.Api.Infrastructure.Maintenance;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

builder.Services.AddHttpClient("ZenQuotes", client =>
{
    client.BaseAddress = new Uri("https://zenquotes.io");
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddSingleton<MaintenanceModeState>();
builder.Services.AddScoped<BackupStore>();
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 2L * 1024 * 1024 * 1024; // 2 GB, generous for a personal-scale backup
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 2L * 1024 * 1024 * 1024;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    var backupStore = scope.ServiceProvider.GetRequiredService<BackupStore>();
    backupStore.EnsureDirectoryExists();
}

app.Use(async (context, next) =>
{
    var maintenance = context.RequestServices.GetRequiredService<MaintenanceModeState>();
    var path = context.Request.Path;
    var isExempt = path.StartsWithSegments("/api/health") || path.StartsWithSegments("/api/admin/backups");
    if (maintenance.IsActive && !isExempt)
    {
        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        await context.Response.WriteAsJsonAsync(new { title = "Maintenance in progress", detail = maintenance.Reason });
        return;
    }
    await next();
});

app.MapHealthChecks("/api/health");
app.MapProjectEndpoints();
app.MapTodoEndpoints();
app.MapResourceEndpoints();
app.MapEnvironmentEndpoints();
app.MapNoteEndpoints();
app.MapWinEndpoints();
app.MapTimelineEndpoints();
app.MapTagEndpoints();
app.MapSearchEndpoints();
app.MapSampleDataEndpoints();
app.MapAdminEndpoints();
app.MapAppSettingsEndpoints();
app.MapQuoteEndpoints();

app.Run();
