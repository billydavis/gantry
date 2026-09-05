# Roadmap

A phased plan for getting v1 built. Each phase should result in something runnable, not just code that compiles.

## Phase 0 — Scaffolding ✅

- [x] Docker Compose skeleton: PostgreSQL container, ASP.NET API container, React PWA container
- [x] ASP.NET Core 10 Minimal API project, empty but running, with a health-check endpoint
- [x] EF Core wired up to PostgreSQL, initial migration (empty)
- [x] React + TypeScript + Vite project scaffolded, Mantine installed, dark theme configured, PWA manifest/service worker in place
- [x] Confirm end-to-end: frontend can hit the API health-check endpoint through Docker Compose

## Phase 1 — Projects ✅

- [x] `Projects` table + migration (including `ParentProjectId`, `Settings` jsonb)
- [x] Vertical slice endpoints: Create, List, Get by Id, Update, Archive
- [x] Frontend: Projects list page, Create/Edit project form (Mantine + React Hook Form + Zod)
- [x] Project detail page shell (Overview section only for now)

## Phase 2 — Todos ✅

- [x] `Todos` table + migration
- [x] Vertical slice endpoints: Create, List (by project, by status, global), Complete, Update, Delete
- [x] Frontend: Todo list component, status/priority filters, quick-add
- [x] Project detail page: Todo List section wired up
- [x] Dashboard: "Today's Todos" widget

## Phase 3 — Resources ✅

- [x] `Resources` table + migration (with `Type` enum)
- [x] Vertical slice endpoints: Create, List (by project), Update, Delete, Reorder
- [x] Frontend: Resource list with type-appropriate icons, Quick Launch section
- [x] Project detail page: Quick Links section wired up

## Phase 4 — Notes & Scratch Pad ✅

- [x] `Notes` table + migration
- [x] Daily note auto-creation logic
- [x] Scratch Pad (single autosaving note, not project-scoped, or a lightweight separate table)
- [x] Frontend: Notes editor (markdown), daily note view, scratch pad panel
- [x] Dashboard: "Recent Notes" widget

## Phase 5 — Wins & Timeline ✅

- [x] `Wins` table + migration
- [x] "Log Win" quick action (global + project-scoped)
- [x] Timeline view aggregating completed Todos + Wins by month
- [x] Dashboard: "Recent Wins" widget

## Phase 6 — Tags & Global Search ✅

- [x] `Tags` table + per-entity join tables
- [x] Tag assignment UI across Projects/Todos/Notes/Resources/Wins
- [x] Filter-by-tag views (tags navigate to global search)
- [x] Global search endpoint (Postgres full-text search) across all taggable entities
- [x] Frontend: global search UI

## Phase 7 — Command Palette & Polish ✅

- [x] Mantine Spotlight command palette (`Ctrl+K`): open project, create todo, jump to note, search
- [x] Dashboard layout configurability (widget show/hide, persisted to localStorage)
- [x] Subprojects UI (tree/breadcrumb navigation for `ParentProjectId` hierarchy)
- [x] PWA install/offline behavior verified
- [x] Mobile responsiveness pass

## v1 Complete ✅

Released 2026-07-27. The app is usable daily: open it, see what to work on, log todos and wins as work happens, and have a searchable record of the year building up automatically.

**What shipped in v1:**
- 8 theme variants (Default, Cobalt DOS, Phosphor, Frostline, Nightshade, Canopy, Graphite, Amber) each with dark/light mode — see note under v1.1 below, this list has since grown and two names changed
- Projects with subproject hierarchy, color coding, status, tags, resources, todos, notes, and wins
- Global Quick Launch dashboard with type-aware icons
- Active Projects and Recently Opened dashboard widgets
- Command palette (`Ctrl+K`) with live search
- Full-text + tag search across all entities
- Timeline view of wins and completed todos
- PWA with offline-capable service worker
- Mobile-responsive layout with collapsible sidebar
- Self-hosted via Docker Compose, no authentication required

---

## v1.1 — shipped, previously undocumented

Work that landed after the 2026-07-27 v1 release but was never folded back into this roadmap or `PROJECT_SPEC.md`. Captured here after an app-wide assessment on 2026-08-23.

- **Knowledge Base (Articles)** — a Markdown-backed `Article` entity (Title, Content, Category, SourceUrl, Tags) with full CRUD, replacing the originally-planned Scratch Pad. Shares the read-only `MarkdownViewerModal` with Notes. UI label is "Knowledge Base" (renamed 2026-08-23); the entity/routes/MCP tools stay named `Article`/`Articles` internally.
- **Environments** — a `ProjectEnvironment` entity (Name, BaseUrl, SortOrder, optionally scoped to a Project), realizing the "optional Environments (Dev/QA/UAT/Prod)" idea from `PROJECT_SPEC.md` §4.2 as a full feature with CRUD endpoints and a frontend area.
- **Markdown everywhere** — Project/Todo/Win/Resource descriptions and Win "impact" now render/edit as Markdown via shared `MarkdownField`/`MarkdownText` components, with a collapsible summary-line pattern (`ExpandableDescription`) so long text doesn't push content down. Includes Mermaid diagram rendering and a code-block copy button, plus guards against wide content causing page-level horizontal scroll.
- **Wins popup viewer** — Wins now open in a read-only popup (matching the Notes/Knowledge Base viewer) from the Timeline instead of navigating into an edit form.
- **Idle-triggered lock screen with optional PIN** — after a configurable idle timeout, a Matrix-rain-styled `LockScreen` covers the app; an optional PIN (hashed via `AppSettings`, with failed-attempt backoff) gates dismissal. Manually triggerable via `Ctrl+L`. This is a UI privacy screen only, not authentication — see `DECISIONS.md`.
- **MCP server** — a Model Context Protocol server exposing ~50 tools across every domain (Projects, Todos, Notes, Wins, Resources, Articles, Environments, Tags, Search, Timeline, Quotes) to AI assistants, gated by bearer-token middleware. Lives inline in the API project as a repo-wide pattern: shared infra in `Features/Mcp/`, with per-domain tool classes co-located under each feature's own `Mcp/` subfolder (e.g. `Features/Projects/Mcp/`).
- **Admin tools** — database backup/restore, a guarded "flush database" that preserves Profile/Appearance settings, and an optional sample-data loader.
- **Icon pack switch** — Tabler → Lucide icons.
- **Theme set grew from 8 to 12** — Frostline was replaced by **Afterglow** and Nightshade by **Synthwave**; **Sundial, Terracotta, Petal, and Rosewood** were added. See `THEMES.md` for the current authoritative list and source lineage; the "What shipped in v1" list above reflects the original 8 at release time and is now stale.
- **Recurring Todos** (2026-09-05) — optional recurrence rule (None/Daily/Weekly/Monthly/Custom-N-days) on Todos. Requires a due date; completing a recurring todo auto-spawns the next occurrence with its due date advanced on a fixed schedule anchored to the original due date (not the completion date), carrying forward Title/Description/Project/Priority/EstimatedMinutes/Tags/recurrence settings so it keeps recurring indefinitely. `RecurrenceParentId` tracks lineage as a plain informational column (no FK).
- **Tag Management** (2026-09-05) — a "Tags" tab in Settings (`TagsSection`) for renaming, merging, and deleting tags across all entities, replacing the previous inline-create-only state (no browsing UI). Renaming supports a custom color via a `ColorPicker` popover alongside the existing preset swatches. `GET /api/tags` now returns a `UsageCount` per tag (summed across all six join tables in one query); `GET /api/tags/{id}/usage` gives an uncapped, exact-match list of every tagged item (reusing the `SearchResult` shape from Search) — surfaced both from the Tags settings tab and as a standalone `/tags/:id` page reached by clicking any tag badge in the app; `POST /api/tags/{sourceId}/merge/{targetId}` reassigns every tagged item from source to target (deduping items already tagged with both) before deleting the source tag. Also fixed a pre-existing bug where renaming a tag to an already-taken name threw an unhandled DB error instead of a 409 Conflict. MCP parity: `delete_tag`, `merge_tags`, `get_tag_usage` added to `TagMcpTools`. Tag management lives in Settings rather than the main sidebar nav since it's an occasional maintenance task, not a daily-use destination like Projects/Notes/Wins.

## Post-v1 (not scheduled)

- Global quick-add button in the sidebar: single "+" that opens a menu to add a Project, Todo, Note, or Win without navigating away from the current page
- Copy URL button on resource links (website type)
- Authentication (Entra / GitHub OAuth / local)
- GitHub integration
- Calendar integration
- AI chat assistant inside the dashboard
- Email reminders
- Time tracking
- Plugin system
- Outlook integration
- Background worker service
- Reverse proxy for clean local URLs
