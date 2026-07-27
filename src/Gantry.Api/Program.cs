using Gantry.Api.Data;
using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Environments;
using Gantry.Api.Features.Notes;
using Gantry.Api.Features.Projects;
using Gantry.Api.Features.Resources;
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
    await SeedAsync(db);
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

app.Run();

static async Task SeedAsync(AppDbContext db)
{
    var now = DateTime.UtcNow;

    // Global resources (dashboard quick launch)
    if (!db.Resources.Any(r => r.ProjectId == null))
    {
        db.Resources.AddRange(
            new Resource { Id = Guid.NewGuid(), Name = "Azure Portal",    Location = "https://portal.azure.com",       Type = ResourceType.Dashboard,     SortOrder = 0, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), Name = "GitHub",          Location = "https://github.com",             Type = ResourceType.GitRepository, SortOrder = 1, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), Name = "Azure DevOps",    Location = "https://dev.azure.com",          Type = ResourceType.Dashboard,     SortOrder = 2, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), Name = "Confluence",      Location = "https://confluence.example.com", Type = ResourceType.Documentation, SortOrder = 3, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), Name = "Teams",           Location = "https://teams.microsoft.com",    Type = ResourceType.Website,       SortOrder = 4, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), Name = "Production Logs", Location = "https://logs.example.com",       Type = ResourceType.Dashboard,     SortOrder = 5, CreatedUtc = now, UpdatedUtc = now }
        );
        await db.SaveChangesAsync();
    }

    // Sample project with environments
    if (!db.Set<ProjectEnvironment>().Any())
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Sample Web App",
            Description = "Demo project showing environment-grouped resources.",
            Status = ProjectStatus.Active,
            CreatedUtc = now,
            UpdatedUtc = now,
        };
        db.Projects.Add(project);

        var prod    = new ProjectEnvironment { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Production", BaseUrl = "https://app.example.com",         SortOrder = 0, CreatedUtc = now, UpdatedUtc = now };
        var staging = new ProjectEnvironment { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Staging",    BaseUrl = "https://staging.example.com",     SortOrder = 1, CreatedUtc = now, UpdatedUtc = now };
        var dev     = new ProjectEnvironment { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Dev",        BaseUrl = "https://dev.example.com",         SortOrder = 2, CreatedUtc = now, UpdatedUtc = now };
        db.Set<ProjectEnvironment>().AddRange(prod, staging, dev);

        db.Resources.AddRange(
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = prod.Id,    Name = "App",        Location = "https://app.example.com",             Type = ResourceType.Website,   SortOrder = 0, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = prod.Id,    Name = "Logs",       Location = "https://logs.example.com/prod",       Type = ResourceType.Dashboard, SortOrder = 1, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = prod.Id,    Name = "Database",   Location = "Server=prod-db;Database=app",          Type = ResourceType.Database,  SortOrder = 2, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = staging.Id, Name = "App",        Location = "https://staging.example.com",         Type = ResourceType.Website,   SortOrder = 0, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = staging.Id, Name = "Logs",       Location = "https://logs.example.com/staging",    Type = ResourceType.Dashboard, SortOrder = 1, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = dev.Id,     Name = "App",        Location = "https://dev.example.com",             Type = ResourceType.Website,   SortOrder = 0, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = dev.Id,     Name = "Swagger UI", Location = "https://dev.example.com/swagger",     Type = ResourceType.Documentation, SortOrder = 1, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = null,        Name = "Repo",       Location = "https://github.com/example/app",      Type = ResourceType.GitRepository, SortOrder = 0, CreatedUtc = now, UpdatedUtc = now },
            new Resource { Id = Guid.NewGuid(), ProjectId = project.Id, EnvironmentId = null,        Name = "ADO Board",  Location = "https://dev.azure.com/example/app",   Type = ResourceType.Dashboard, SortOrder = 1, CreatedUtc = now, UpdatedUtc = now }
        );
        await db.SaveChangesAsync();
    }

    // Sample notes
    if (!db.Notes.Any())
    {
        var today = DateOnly.FromDateTime(now);
        var sampleProject = db.Projects.FirstOrDefault(p => p.Name == "Sample Web App");

        db.Notes.AddRange(
            new Note
            {
                Id = Guid.NewGuid(),
                Date = today,
                Content = """
                    ## Meetings
                    - Sprint planning at 10am — agreed on 3 stories for the week
                    - Quick sync with design on new onboarding flow

                    ## Ideas
                    - Could we cache the dashboard data in the service worker for offline use?
                    - Worth looking at whether Postgres LISTEN/NOTIFY could replace polling

                    ## Things I Learned
                    - `DateOnly` in EF Core maps cleanly to `date` in Postgres — no timezone issues
                    - `dotnet watch` polling mode is needed inside Docker on Windows volumes

                    ## Questions
                    - Who owns the staging DB credentials?
                    - Is the OAuth redirect URI whitelisted for the new staging subdomain?

                    ## Tomorrow
                    - Finish the resource environment grouping feature
                    - Review PR from Sarah on the auth middleware
                    """,
                CreatedUtc = now,
                UpdatedUtc = now,
            },
            new Note
            {
                Id = Guid.NewGuid(),
                Date = today.AddDays(-1),
                Content = """
                    ## Meetings
                    - Backlog refinement — groomed 8 tickets, estimated 5

                    ## Ideas
                    - Dark mode toggle should persist across devices via user settings, not just localStorage

                    ## Things I Learned
                    - EF Core `HasSentinel` is needed when the default value matches the CLR default (e.g. `Priority.Low` = 0)

                    ## Questions
                    - Do we need to support IE11 anywhere still?

                    ## Tomorrow
                    - Sprint planning
                    - Follow up on blocked ticket #4421
                    """,
                CreatedUtc = now.AddDays(-1),
                UpdatedUtc = now.AddDays(-1),
            },
            new Note
            {
                Id = Guid.NewGuid(),
                Date = today.AddDays(-2),
                Content = """
                    ## Meetings
                    - Production incident post-mortem: root cause was a missing index on `Orders.CustomerId`
                    - 1:1 with manager — feedback was positive, discussed stretch goal for Q3

                    ## Ideas
                    - Add an "estimated time" rollup per project to the dashboard

                    ## Things I Learned
                    - `pg_stat_activity` is invaluable for diagnosing slow queries in prod
                    - Connection pool exhaustion looks identical to a slow query from the app side

                    ## Questions
                    - Should wins be tied to a sprint/iteration, or just a date?

                    ## Tomorrow
                    - Backlog refinement
                    - Add the missing index to staging and schedule prod deploy
                    """,
                CreatedUtc = now.AddDays(-2),
                UpdatedUtc = now.AddDays(-2),
            }
        );

        if (sampleProject is not null)
        {
            db.Notes.AddRange(
                new Note
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    Title = "Architecture Notes",
                    Content = """
                        ## Overview
                        ASP.NET Core 10 Minimal API + React PWA. Deployed via Docker Compose.

                        ## Key Decisions
                        - Vertical Slice architecture — no MediatR, logic stays in the endpoint until it earns extraction
                        - PostgreSQL over SQLite — JSONB support, full-text search, room to grow
                        - No auth in v1 — trusted local deployment only

                        ## Open Questions
                        - Do we need a background worker for scheduled tasks?
                        - Rate limiting strategy for the public-facing endpoints?

                        ## TODOs
                        - [ ] Add Prometheus metrics endpoint
                        - [ ] Set up structured logging with Seq
                        - [ ] Review connection pool sizing for prod load
                        """,
                    CreatedUtc = now.AddDays(-5),
                    UpdatedUtc = now.AddDays(-1),
                },
                new Note
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    Title = "Deployment Runbook",
                    Content = """
                        ## Pre-deploy checklist
                        - [ ] Run migrations against staging: `dotnet ef database update`
                        - [ ] Smoke test staging environment
                        - [ ] Check for any pending feature flags to enable
                        - [ ] Notify #deployments Slack channel

                        ## Deploy steps
                        1. Merge PR to `main`
                        2. CI pipeline builds and pushes image to ACR
                        3. `docker compose pull && docker compose up -d` on the prod server
                        4. Watch logs for 5 minutes: `docker compose logs -f api`

                        ## Rollback
                        ```bash
                        docker compose pull api:<previous-tag>
                        docker compose up -d api
                        ```
                        """,
                    CreatedUtc = now.AddDays(-3),
                    UpdatedUtc = now.AddDays(-3),
                }
            );
        }

        await db.SaveChangesAsync();
    }

    // Sample wins
    if (!db.Wins.Any())
    {
        var today = DateOnly.FromDateTime(now);
        var sampleProject = db.Projects.FirstOrDefault(p => p.Name == "Sample Web App");

        db.Wins.AddRange(
            new Win
            {
                Id = Guid.NewGuid(),
                ProjectId = sampleProject?.Id,
                Title = "Resolved production incident in under 30 minutes",
                Description = "Diagnosed a connection pool exhaustion issue under load. Added a missing index on `Orders.CustomerId` and tuned pool size. Zero downtime.",
                Impact = "Reduced p99 query latency from 8s to 120ms. No customer-reported data loss.",
                Date = today.AddDays(-2),
                CreatedUtc = now.AddDays(-2),
                UpdatedUtc = now.AddDays(-2),
            },
            new Win
            {
                Id = Guid.NewGuid(),
                ProjectId = sampleProject?.Id,
                Title = "Shipped environment-grouped resources feature",
                Description = "Designed and shipped the environments + resources grouping UI in a single sprint. Included backend migrations, vertical slice endpoints, and the full Mantine frontend.",
                Impact = "Significantly reduced context-switching when switching between prod/staging/dev.",
                Date = today.AddDays(-5),
                CreatedUtc = now.AddDays(-5),
                UpdatedUtc = now.AddDays(-5),
            },
            new Win
            {
                Id = Guid.NewGuid(),
                Title = "Positive Q2 performance review",
                Description = "Received strong feedback on technical depth, communication, and ownership. Discussed stretch goal for Q3: leading the migration to the new auth system.",
                Impact = "On track for senior promotion cycle.",
                Date = today.AddDays(-10),
                CreatedUtc = now.AddDays(-10),
                UpdatedUtc = now.AddDays(-10),
            },
            new Win
            {
                Id = Guid.NewGuid(),
                Title = "Cut deploy time from 45 min to 8 min",
                Description = "Parallelized the Docker build stages and moved static asset compilation out of the runtime image. Switched from `latest` tags to digest-pinned images for deterministic builds.",
                Impact = "Faster feedback loop for the whole team. CI costs down ~30%.",
                Date = today.AddDays(-18),
                CreatedUtc = now.AddDays(-18),
                UpdatedUtc = now.AddDays(-18),
            }
        );
        await db.SaveChangesAsync();
    }

    // Sample tags
    if (!db.Tags.Any())
    {
        db.Tags.AddRange(
            new Tag { Id = Guid.NewGuid(), Name = "backend",     Color = "#4dabf7" },
            new Tag { Id = Guid.NewGuid(), Name = "frontend",    Color = "#74c0fc" },
            new Tag { Id = Guid.NewGuid(), Name = "infra",       Color = "#868e96" },
            new Tag { Id = Guid.NewGuid(), Name = "performance", Color = "#ffa94d" },
            new Tag { Id = Guid.NewGuid(), Name = "bug",         Color = "#ff6b6b" },
            new Tag { Id = Guid.NewGuid(), Name = "milestone",   Color = "#a9e34b" },
            new Tag { Id = Guid.NewGuid(), Name = "team",        Color = "#69db7c" },
            new Tag { Id = Guid.NewGuid(), Name = "security",    Color = "#cc5de8" },
            new Tag { Id = Guid.NewGuid(), Name = "docs",        Color = "#f783ac" },
            new Tag { Id = Guid.NewGuid(), Name = "ux",          Color = "#4dabf7" }
        );
        await db.SaveChangesAsync();
    }
}
