# AI Coding Agent Instructions

These are standing instructions for any AI coding agent (Claude Code, Copilot, etc.) working in this repository. Read `PROJECT_SPEC.md`, `ARCHITECTURE.md`, and `DATABASE.md` before making changes.

## Non-negotiables

- **.NET 10** for the backend — do not scaffold against an older target framework.
- **No MediatR** and no other mediator library. Endpoints handle their own logic directly. See `ARCHITECTURE.md` for the reasoning.
- **Vertical Slice** organization: new features get their own folder under `Features/{Entity}/{Action}/`, not a horizontal `Controllers/` + `Services/` + `Repositories/` split.
- **One class per file.** Don't combine `Request`, `Response`, `Validator`, and `Endpoint` into a single file.
- **Mantine UI** for all frontend components — don't introduce a second component library.
- **PostgreSQL** — don't substitute SQLite or another database, even for local dev convenience, since JSONB and Postgres-specific features are part of the design.

## When adding a new feature slice

Follow this structure exactly, matching the pattern used elsewhere in the codebase:

```
Features/{Entity}/{Action}/
├── Endpoint.cs      // Minimal API route registration + inline handler logic
├── Request.cs        // Input DTO
├── Response.cs        // Output DTO
└── Validator.cs        // FluentValidation validator for Request
```

Keep logic inline in `Endpoint.cs` unless it is reused elsewhere or the endpoint has grown unwieldy. If extracting, create a single-purpose class named after what it does (e.g. `ProjectCreator.cs`), not a generic `ProjectService.cs` grab-bag.

## Database changes

- Any schema change goes through an EF Core migration — don't hand-edit the database.
- Check `DATABASE.md` for the current intended schema before adding columns; update `DATABASE.md` if a change diverges from what's documented there.
- Prefer normalized relational tables; use `jsonb` only for genuinely flexible, low-query attributes (see `Projects.Settings` as the reference example).

## Frontend conventions

- TanStack Query for all server data fetching/caching — no ad-hoc `fetch` calls scattered in components.
- React Hook Form + Zod for all forms; validation rules should mirror the backend FluentValidation rules where practical.
- Dark theme is the default Mantine theme — don't default to light mode.

## Tags

Tags apply across Projects, Todos, Notes, Resources, and Wins. When adding tag support to a new entity, follow the existing per-entity join table pattern (e.g. `ProjectTags`) rather than introducing a polymorphic tagging system, unless that decision has been explicitly revisited in `DECISIONS.md`.

## General style

- Async all the way through, no sync-over-async.
- Favor explicit, boring code over clever abstractions — this project is optimized for an AI agent (and a future version of the developer) to be able to read one file and understand exactly what happens, without chasing behavior through several layers of indirection.
- If a design decision in this file conflicts with something in `PROJECT_SPEC.md`, `ARCHITECTURE.md`, or `DATABASE.md`, treat those as the source of truth and flag the conflict rather than guessing.
