# Architecture

## Pattern: Vertical Slice, No Mediator

Features are organized by feature, not by technical layer. Vertical Slice Architecture and MediatR are treated as separate concerns — MediatR made vertical slices popular, but the two ideas aren't dependent on each other. This project uses vertical slices without a mediator library, dispatching directly through ASP.NET Core Minimal API endpoints.

### Folder structure

```
Features/
├── Projects/
│   ├── Create/
│   │   ├── Endpoint.cs
│   │   ├── Request.cs
│   │   ├── Response.cs
│   │   └── Validator.cs
│   ├── Update/
│   └── List/
├── Todos/
│   ├── Create/
│   ├── Complete/
│   └── List/
├── Resources/
├── Notes/
└── Wins/
```

Each feature slice is self-contained. To find or fix anything, go to the folder named after the feature.

### Rule: logic stays local until it earns extraction

Default position: the endpoint handles receiving the request, validating it, running the logic, and returning the response.

```csharp
app.MapPost("/projects", async (
    CreateProjectRequest request,
    AppDbContext db,
    CancellationToken ct) =>
{
    // validation, logic, persistence, response — all here initially
});
```

Only extract a class (e.g. `ProjectCreator.cs`) once logic is reused by more than one endpoint, or a single endpoint's logic grows large enough to hurt readability. Don't pre-build a service layer speculatively.

### One class per file

Favor:
```
Create/
├── Endpoint.cs
├── Request.cs
├── Response.cs
└── Validator.cs
```

over a single `CreateProject.cs` containing everything. Small, single-responsibility files are easier for both humans and AI coding agents to reason about and modify safely.

---

## Why not MediatR

MediatR's licensing changed to a paid model requiring annual license management, which is a poor fit for a personal project even though usage would qualify for free tiers in some cases. Most applications, this one included, use a small fraction of what a mediator library provides. Minimal APIs plus vertical slices delivers the same organizational benefit without the dependency.

If a mediator-like abstraction is ever wanted later, a small hand-rolled dispatcher (a couple hundred lines) is a reasonable option — but this is explicitly out of scope for v1.

---

## Backend Conventions

- **.NET 10**, ASP.NET Core Minimal APIs
- Entity Framework Core for data access
- FluentValidation for request validation, one validator per request type, colocated in the feature folder
- Async all the way through; no sync-over-async
- DTOs are explicit per-endpoint (`Request.cs` / `Response.cs`), not shared "God" DTOs reused across features
- Prefer records for DTOs where practical

---

## Frontend Conventions

- React + TypeScript, Vite build
- Mantine UI as the component library, dark theme by default
- TanStack Query for server state, TanStack Table for tabular views
- React Hook Form + Zod for form state and validation, matching backend validation rules where possible
- Feature-based folder structure mirroring the backend where reasonable
- Vite `server.proxy` forwards `/api/*` to the ASP.NET backend in local dev — no CORS configuration needed. In Docker, a reverse proxy (Caddy or nginx) handles the same routing so both environments are same-origin.

---

## AI-Agent-Friendly Design Goals

This project is expected to be built largely with AI coding assistance, so the architecture is deliberately optimized for that:

- Predictable, repeated file structure per feature slice makes it easy for an agent to infer conventions from one example and apply them elsewhere
- One class per file keeps diffs and context windows small
- No hidden magic (no heavy reflection-based mediator pipelines, no complex DI conventions) — an agent should be able to trace a request from HTTP endpoint to database and back without jumping through abstraction layers
- Database schema favors clarity over cleverness (see `DATABASE.md`)
