using Gantry.Api.Data;
using Gantry.Api.Features.Admin;
using Gantry.Api.Features.Environments;
using Gantry.Api.Features.Notes;
using Gantry.Api.Features.Projects;
using Gantry.Api.Features.Resources;
using Gantry.Api.Features.SampleData;
using Gantry.Api.Features.Search;
using Gantry.Api.Features.Tags;
using Gantry.Api.Features.Timeline;
using Gantry.Api.Features.Todos;
using Gantry.Api.Features.Wins;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

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

app.Run();
