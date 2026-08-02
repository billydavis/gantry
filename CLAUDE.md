# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Gantry is a self-hosted personal work dashboard (PWA). It answers "what should I be working on right now?" and accumulates a searchable record of the year to make end-of-year self-reviews trivial. See `PROJECT_SPEC.md` for the full feature list and `ROADMAP.md` for the phased build plan.

## Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core **10** Minimal APIs, EF Core, FluentValidation |
| Frontend | React, TypeScript, Vite, Mantine UI, TanStack Query, TanStack Table, React Hook Form + Zod |
| Database | PostgreSQL (JSONB for flexible attributes, full-text search) |
| Deployment | Docker Compose (API container, frontend container, PostgreSQL container) |

## Commands

**Backend** (`src/Gantry.Api`):
```sh
dotnet build                          # build
dotnet run                            # run locally (uses appsettings.Development.json)
dotnet ef migrations add <Name>       # new EF Core migration
dotnet ef database update             # apply migrations (requires DB)
```

**Frontend** (`src/web`):
```sh
npm run dev       # Vite dev server on :5173, proxies /api/* → localhost:5000
npm run build     # production build to dist/
npx tsc --noEmit  # type-check without building
```

**Docker** (repo root — requires Docker Desktop running):
```sh
cp .env.example .env                  # first-time setup
docker compose build                  # build all images
docker compose up                     # start stack (app on :8080)
docker compose up --build             # rebuild and start
docker compose down                   # stop (data volume preserved)
docker compose down -v                # stop and destroy data volume
```

## Non-negotiables

- **.NET 10** — do not scaffold against an older target framework.
- **No MediatR** or any mediator library. Endpoints handle logic directly.
- **Vertical Slice** organization: `Features/{Entity}/{Action}/`, not a horizontal `Controllers/` + `Services/` split.
- **One class per file** — `Request`, `Response`, `Validator`, and `Endpoint` each get their own file.
- **Mantine UI** for all frontend components — do not introduce a second component library.
- **PostgreSQL** — do not substitute SQLite or another database, even for local dev.
- **Dark theme** is the Mantine default — do not default to light mode.

## Backend architecture

Features follow Vertical Slice without a mediator. Each slice is self-contained:

```
Features/
├── Projects/
│   ├── Create/
│   │   ├── Endpoint.cs      # Minimal API route + inline handler logic
│   │   ├── Request.cs
│   │   ├── Response.cs
│   │   └── Validator.cs
│   ├── Update/
│   └── List/
├── Todos/
├── Resources/
├── Notes/
└── Wins/
```

Logic stays in `Endpoint.cs` by default. Extract a named class (e.g. `ProjectCreator.cs`) only when logic is reused across endpoints or a single handler grows unwieldy. Do not pre-build a Services layer.

## Frontend conventions

- TanStack Query for all server data fetching/caching — no ad-hoc `fetch` calls in components.
- React Hook Form + Zod for all forms; mirror backend FluentValidation rules where practical.
- Feature-based folder structure mirroring the backend.

### Theming

Twelve themes (Default, Cobalt DOS, Phosphor, Afterglow, Synthwave, Canopy, Graphite, Amber, Sundial, Terracotta, Petal, Rosewood), each with a dark and light variant. See `THEMES.md` for the full list and internal ID mapping.

**Infrastructure** (`src/web/src/themes/`):
- `theme-defs.ts` — `ThemeTokens` type + all 24 token sets (12 themes × 2 modes)
- `ThemeProvider.tsx` — wraps `MantineProvider`; exposes `useAppTheme()` hook; persists selection to `localStorage` under `gantry-theme` and `gantry-color-scheme`
- `cssVariablesResolver` injects `--g-*` CSS variables (available everywhere) and overrides Mantine's body/surface variables so Mantine components pick up the active theme automatically

**Token reference** (use these CSS variables in component styles):
```
--g-background   --g-sidebar      --g-surface     --g-border
--g-text         --g-text-muted   --g-heading
--g-accent       --g-accent-text
--g-nav-active-bg  --g-nav-active-text
--g-success      --g-danger
```

`useAppTheme()` returns `{ themeId, colorScheme, themes, setThemeId, setColorScheme }`. Theme + mode are stored in `localStorage` and survive page refresh. `forceColorScheme` is passed to Mantine so its built-in dark/light mode tracks the user's selection.

## Database conventions

- Schema changes go through EF Core migrations — do not hand-edit the database.
- Check `DATABASE.md` for the current intended schema before adding columns; update it if a change diverges.
- Prefer normalized relational tables; use JSONB only for genuinely flexible, low-query attributes.
- `Projects.Settings` (jsonb) is the reference example for JSONB usage.
- Tags apply across Projects, Todos, Notes, Resources, and Wins via per-entity join tables (`ProjectTags`, `TodoTags`, etc.) — do not use a polymorphic tagging system unless `DECISIONS.md` says otherwise.

## Key design decisions

See `DECISIONS.md` for the full log. Short version:
- PostgreSQL over SQLite: JSONB, full-text search, room to grow.
- No MediatR: license changed to paid; vertical slices work fine without it.
- Logic in endpoint until it earns extraction: avoids premature abstraction.
- Hierarchical projects via nullable `ParentProjectId` self-reference.
- Resources (not Links): covers URLs, UNC paths, `vscode://` URIs, local paths, etc.
- Wins entity is separate from Todos: captures impact/accomplishments for performance reviews.
- No authentication in v1: single-user, trusted local Docker deployment.

## Related documents

- `PROJECT_SPEC.md` — full feature list and v1 scope
- `ARCHITECTURE.md` — vertical slice conventions and coding standards in detail
- `DATABASE.md` — schema, entity relationships, JSONB guidance
- `ROADMAP.md` — phased build plan (Phase 0 = scaffolding through Phase 7 = polish)
- `DECISIONS.md` — running decisions log
- `AI_INSTRUCTIONS.md` — standing instructions for AI agents (this file supersedes it for Claude Code)
- `SECURITY.md` — security considerations
