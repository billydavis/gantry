# Developer Dashboard — Project Specification

## 1. Vision

A self-hosted Progressive Web App (PWA) that serves as a personal work dashboard — the first thing opened every workday. It acts as a central hub for projects, notes, todos, quick links, and accomplishments, reducing context switching and building a searchable history of work over time.

This exists because company policy forces all browsers to open the corporate intranet by default, with no way to change that behavior. Rather than fight it, this app becomes a personal launchpad that lives alongside it.

**This is not** an attempt to compete with Notion, Jira, or Confluence. The goal is a lightweight, fast, personal system — not a general-purpose productivity suite.

### Primary question the app answers

> "What should I be working on right now?"

### Secondary benefit

If used consistently throughout the year, the app should make writing an end-of-year self-review trivial — pulling from a running log of completed tasks and logged "wins" instead of reconstructing eleven months of work from Git history, Jira, Teams, and Outlook.

---

## 2. Core Principles

- Fast to open
- Keyboard friendly (command palette via `Ctrl+K`)
- Mobile responsive
- Self-hosted with Docker
- Offline capable (PWA)
- Everything searchable
- Everything taggable
- AI-friendly data model (clean, predictable schema that's easy for coding agents to reason about)
- Simple first, extensible later — let complexity earn its way in

---

## 3. Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Mantine UI (dark mode as default theme)
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- PWA support (service worker, manifest, installable)

### Backend
- ASP.NET Core **10** Minimal APIs
- Entity Framework Core
- FluentValidation
- No MediatR — see `ARCHITECTURE.md` for reasoning and pattern used instead

### Database
- PostgreSQL
- JSONB columns for flexible/semi-structured settings
- Full-text search where useful (project/note/task search)

### Authentication
- **v1:** none — app assumes a trusted local Docker deployment
- **Future:** Microsoft Entra, GitHub OAuth, or local accounts

### Infrastructure
- Docker Compose: PWA frontend, ASP.NET API, PostgreSQL
- Future additions: background worker, AI service, reverse proxy

```
Browser
   ↓
React PWA
   ↓
ASP.NET API
   ↓
PostgreSQL
```

---

## 4. V1 Features

### 4.1 Dashboard (Home)

Answers: "What should I be working on?"

Widgets:
- Today's Todos
- Active Projects
- Recent Notes
- Recently Opened Projects
- Quick Launch
- Recent Wins

Dashboard layout should be configurable.

### 4.2 Projects

Fields:
- Name
- Description
- Status
- Color
- Tags
- `ParentProjectId` (nullable — enables subprojects / hierarchy)
- Created / Updated timestamps

Relationships:
- Notes
- Todos
- Resources (links, files, UNC shares, repos, etc.)
- Wins
- Optional Environments (Dev / QA / UAT / Prod)

Project Page sections:
- Overview
- Quick Links (Resources)
- Todo List
- Recent Notes
- Wins
- Timeline

Projects can be nested arbitrarily deep via `ParentProjectId`, though most will only go one level (e.g. "Client Portal" → "Authentication" → "OAuth").

### 4.3 Todo System

Fields:
- Title
- Description
- Project (link)
- Status: `Todo`, `In Progress`, `Waiting`, `Blocked`, `Complete`
- Priority: `Low`, `Medium`, `High`
- Estimated time (optional)
- Tags
- Due date (optional)

The dashboard should be able to answer queries like "show me all 30-minute tasks" or "show me everything for Project X" based on this metadata.

### 4.4 Resources (formerly "Links")

Broader than simple bookmarks — anything that provides quick access to something project-related.

Fields:
- Name
- Location (a URL, UNC path, local file path, `vscode://` link, etc.)
- Type
- Description
- Sort order

Types:
- Website
- UNC Share
- Local Folder
- Local File
- Git Repository
- Documentation
- Environment
- Dashboard
- Database
- Other

### 4.5 Daily Notes

Each day gets an auto-created note with structure:
- Meetings
- Ideas
- Things I learned
- Questions
- Tomorrow

Notes are searchable indefinitely.

### 4.6 Scratch Pad

An always-available, autosaving space for transient content: SQL queries, regex, connection strings, JSON payloads, random URLs — anything not worth filing anywhere permanent.

### 4.7 Wins Log

A simple "Log Win" action for capturing accomplishments as they happen rather than trying to remember them at review time.

Fields:
- Title
- Project (link)
- Date
- Impact (free text)
- Tags

Examples of what gets logged: customer compliments, resolved production issues, successful deployments, performance improvements, new skills learned, positive manager feedback, presentations given.

### 4.8 Quick Launch

A section of large, one-click buttons to frequently used destinations (Azure Portal, GitHub, Teams, DevOps, Jenkins, Production Logs, Kibana, Confluence, etc.), separate from project-specific Resources.

### 4.9 Command Palette

`Ctrl+K` opens a Spotlight-style command palette (via Mantine) to:
- Open a project
- Create a todo
- Jump to a note
- Search everything
- Run common actions

### 4.10 Global Search

Search across projects, todos, notes, resources, and wins from one place.

### 4.11 Timeline / Year-in-Review View

Aggregates completed todos and logged wins chronologically, grouped by month, to generate a narrative of the year's work — directly supporting the end-of-year review use case.

---

## 5. Post-V1 / Future Enhancements

- GitHub integration
- Calendar integration
- AI chat / assistant integrated into the dashboard
- Email reminders
- Time tracking
- Plugin system
- Outlook integration
- Authentication (Entra / GitHub OAuth / local accounts)
- Background worker service
- Reverse proxy for cleaner local URLs

---

## 6. Document Index

This spec is the entry point. Related documents:

- `ARCHITECTURE.md` — Vertical Slice conventions, folder structure, coding standards
- `DATABASE.md` — schema, entity relationships
- `ROADMAP.md` — phased plan for building v1
- `AI_INSTRUCTIONS.md` — instructions for AI coding agents working in this repo
- `DECISIONS.md` — running log of decisions made and why
