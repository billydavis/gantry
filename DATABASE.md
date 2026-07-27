# Database

PostgreSQL, accessed via Entity Framework Core. Chosen over SQLite for room to grow, JSONB support, and because it's a good learning opportunity coming from a SQL Server / MySQL / Oracle background.

## Design principles

- Start relational; use JSONB for genuinely flexible/variable data (e.g. per-project settings) instead of constantly adding columns
- Everything taggable — projects, todos, notes, resources, and wins all support tags
- Hierarchical projects via self-referencing `ParentProjectId`
- Favor clarity over cleverness so both humans and AI agents can reason about the schema easily

---

## Core Tables

### Projects

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| ParentProjectId | nullable FK → Projects.Id | enables subprojects, unlimited nesting |
| Name | text | |
| Description | text | |
| Status | text/enum | e.g. Active, Archived, On Hold |
| Color | text | for UI |
| Settings | jsonb | flexible per-project settings (theme, default branch, recent commands, etc.) |
| CreatedUtc | timestamptz | |
| UpdatedUtc | timestamptz | |

### Todos

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| ProjectId | nullable FK → Projects.Id | null = global/unassigned todo not tied to a project |
| Title | text | |
| Description | text | |
| Status | enum | Todo, InProgress, Waiting, Blocked, Complete |
| Priority | enum | Low, Medium, High |
| EstimatedMinutes | int, nullable | |
| DueDate | date, nullable | |
| CompletedUtc | timestamptz, nullable | drives the year-in-review timeline |
| CreatedUtc | timestamptz | |
| UpdatedUtc | timestamptz | |

### Resources

Generalized from a simple "Links" table to cover anything project-related worth quick access to.

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| ProjectId | FK → Projects.Id | |
| Name | text | |
| Location | text | URL, UNC path (`\\server\share\...`), local path, `vscode://` URI, etc. |
| Type | enum | Website, UncShare, LocalFolder, LocalFile, GitRepository, Documentation, Environment, Dashboard, Database, Other |
| Description | text | |
| SortOrder | int | |

### Notes

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| ProjectId | FK → Projects.Id, nullable | daily notes may not be project-scoped |
| Date | date | for daily notes |
| Markdown | text | note body |
| CreatedUtc | timestamptz | |

### Wins

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| ProjectId | FK → Projects.Id, nullable | |
| Title | text | |
| Impact | text | free-text description of impact |
| Date | date | |
| CreatedUtc | timestamptz | |

### Tags

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| Name | text | unique |

### Taggable join tables

Given multiple entities are taggable (Projects, Todos, Notes, Resources, Wins), use a generic polymorphic join or one join table per entity type — decide during implementation based on EF Core ergonomics. Simplest starting point is one join table per entity (`ProjectTags`, `TodoTags`, etc.) since it keeps foreign keys clean and avoids a polymorphic `EntityType` discriminator column.

---

## Optional: Environments

Not required for v1, but the schema should not preclude it. An optional `Environment` field/table lets Resources be grouped under Dev / QA / UAT / Prod per project, e.g.:

```
Authentication
  Development
    - API
    - Swagger
    - Logs
  QA
    - API
    - Swagger
    - Database
  Production
    - API
    - Grafana
    - Kibana
```

This can be modeled as a nullable `Environment` text/enum column on `Resources` for v1, and normalized into its own table later if needed.

---

## Notes on JSONB usage

`Projects.Settings` is the primary candidate for JSONB in v1, e.g.:

```json
{
  "theme": "blue",
  "favorite": true,
  "defaultBranch": "main",
  "recentCommands": ["dotnet test", "docker compose up"]
}
```

Avoid overusing JSONB for data that's genuinely relational (e.g. don't put todos or tags in JSONB) — it's for flexible, low-query-need attributes only.
