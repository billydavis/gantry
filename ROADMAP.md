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
- 8 theme variants (Default, Cobalt DOS, Phosphor, Frostline, Nightshade, Canopy, Graphite, Amber) each with dark/light mode
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
