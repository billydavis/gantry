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
| Link | text, nullable | e.g. `vscode://`, ADO work item URL |
| Status | enum | Todo, InProgress, Waiting, Blocked, Complete |
| Priority | enum | Low, Medium, High |
| EstimatedMinutes | int, nullable | |
| DueDate | date, nullable | |
| IsPinned | bool | pins the todo to the top of the list |
| CompletedUtc | timestamptz, nullable | drives the year-in-review timeline |
| DeletedUtc | timestamptz, nullable | soft delete |
| CreatedUtc | timestamptz | |
| UpdatedUtc | timestamptz | |
| RecurrenceType | enum | None, Daily, Weekly, Monthly, Custom |
| RecurrenceIntervalDays | int, nullable | only set (and required) when RecurrenceType = Custom |
| RecurrenceParentId | uuid, nullable | id of the todo this one was auto-spawned from on completion; plain column, no FK constraint (informational lineage only) |

Tags apply via the `TodoTags` many-to-many join table (see [Taggable join tables](#taggable-join-tables) below).

Recurrence requires `DueDate` to be set — the next occurrence's due date is computed as `DueDate + interval` (fixed schedule anchored to the original due date, not the completion date). Monthly recurrence anchors to month-end: if the current due date is the last day of its month (e.g. Jan 31, or Feb 28/29 in a non-leap/leap year), the next occurrence lands on the last day of the *following* month too (Jan 31 → Feb 28 → Mar 31 → Apr 30 → May 31, …), so a month-end todo never drifts down to a fixed day-of-month; a non-month-end date (e.g. the 15th) just adds one calendar month normally (see `RecurrenceCalculator.AddMonthAnchoredToMonthEnd`). Completing a recurring todo (via `POST /complete` or `PUT` with `status: Complete`) inserts a new Todo row with `Status = Todo`, the computed `DueDate`, and `RecurrenceParentId` set to the completed todo's id; it copies Title/Description/Link/ProjectId/Priority/EstimatedMinutes/Tags/RecurrenceType/RecurrenceIntervalDays so the chain keeps recurring indefinitely.

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
| DeletedUtc | timestamptz, nullable | soft-delete |

### Wins

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| ProjectId | FK → Projects.Id, nullable | |
| Title | text | |
| Impact | text | free-text description of impact |
| Date | date | |
| CreatedUtc | timestamptz | |
| DeletedUtc | timestamptz, nullable | soft-delete |

### Tags

| Column | Type | Notes |
|---|---|---|
| Id | uuid | PK |
| Name | text | unique (case-insensitive collision check enforced at the API layer on create/rename) |
| Color | text, nullable | hex color, e.g. `#4dabf7` |

### Taggable join tables

One join table per taggable entity — `ProjectTags`, `TodoTags`, `NoteTags`, `ResourceTags`, `WinTags`, `ArticleTags` — each a composite-PK (`TagId`, `<Entity>Id`) shadow entity with `OnDelete(DeleteBehavior.Cascade)` on both foreign keys. Deleting a Tag (or a tagged entity) cascades and silently removes the corresponding join rows; the tagged entity itself is untouched. Merging two tags (`POST /api/tags/{sourceId}/merge/{targetId}`) reassigns every join row from the source tag to the target across all six tables — deduping first so an item already carrying both tags ends up with a single join row for the target — then deletes the source tag; this is pure application logic (raw SQL against the join tables), not a schema feature.

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

## AppSettings

Single-row table holding app-wide preferences (not per-entity data).

| Column | Type | Notes |
|---|---|---|
| `Id` | uuid | PK |
| `DisplayName` | varchar(100), nullable | |
| `Email` | varchar(320), nullable | used only for Gravatar lookup |
| `LockEnabled` | bool, default `true` | idle-lock screen on/off |
| `IdleTimeoutMinutes` | int, default `5` | minutes of inactivity before the lock screen shows |
| `PinHash` | varchar(200), nullable | PBKDF2 hash of the optional lock-screen PIN; `null` means no PIN is set |
| `PinSalt` | varchar(200), nullable | salt paired with `PinHash` |
| `UpdatedUtc` | timestamptz | |

`PinHash`/`PinSalt` are never returned over the API — `GET /api/settings` exposes only a computed `HasPin` boolean. The lock screen is a local UI privacy lock, not authentication (see `DECISIONS.md`).

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
