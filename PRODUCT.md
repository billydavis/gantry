# Product

## Register

product

## Users

Solo user (Billy), daily driver. Open in a browser tab throughout the workday as a self-hosted personal work dashboard. Used to glance at "what should I be working on right now," log todos/notes/wins as the day happens, and later mine the accumulated record for end-of-year self-reviews.

## Product Purpose

Gantry answers "what should I be working on right now?" and accumulates a searchable record of the year so end-of-year self-reviews are trivial. It aggregates projects, todos, resources, notes, and wins into a single dashboard, avoiding the need to hop between separate tools to reconstruct what happened and why.

## Brand Personality

Calm, low-noise. The interface should recede into the background rather than compete for attention — clear hierarchy, generous breathing room, nothing decorative fighting the content. Information-dense screens (like the todo list) should still read as calm, not cluttered.

## Anti-references

- Generic SaaS card-grid clichés: identical bordered cards with icon + heading + text, repeated endlessly, used as a lazy default affordance.
- Overly dense spreadsheet/table feel — this is a personal dashboard, not an admin data grid.
- Hero-metric templates, gradient text, glassmorphism-as-decoration, side-stripe accent borders — none of these fit a calm single-user tool.

## Design Principles

- Respect the existing 8-theme token system (`--g-*` CSS variables in `src/web/src/themes/theme-defs.ts`). Layout and hierarchy work must never introduce new hardcoded colors or bypass the token system — colors are out of scope for layout fixes.
- Hierarchy through spacing, scale, and weight — not borders, boxes, or decoration. The most important piece of information (e.g. a todo's title) should read as the most important thing without needing a container to say so.
- Calm information density: a personal daily-use tool should let the user scan quickly without visual noise, even when a list is long or items carry a lot of metadata (due dates, tags, priority, project).
- Single-user, no enterprise chrome: no permission gates, roles, or multi-tenant affordances anywhere in the UI — this is a trusted local tool for one person.

## Accessibility & Inclusion

No specific stated requirements beyond reasonable defaults: sufficient color contrast within each theme, keyboard-operable controls, and no motion that can't be disabled/reduced. No known assistive-technology users to design for beyond that baseline.
