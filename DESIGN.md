---
name: Gantry
description: Self-hosted personal work dashboard — calm instrument panel for one user.
colors:
  g-background: "#1a1b1e"
  g-sidebar: "#141517"
  g-surface: "#25262b"
  g-border: "#2c2e33"
  g-text: "#c1c2c5"
  g-text-muted: "#909296"
  g-heading: "#f1f3f5"
  g-accent: "#339af0"
  g-accent-text: "#06131f"
  g-nav-active-bg: "#1c3a5e"
  g-nav-active-text: "#74c0fc"
  g-success: "#37b24d"
  g-danger: "#f03e3e"
typography:
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "\"Cascadia Code\", Consolas, \"Courier New\", monospace"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
components:
  button-primary:
    backgroundColor: "{colors.g-accent}"
    textColor: "{colors.g-accent-text}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.g-surface}"
    rounded: "{rounded.lg}"
  list-row:
    backgroundColor: "{colors.g-surface}"
    rounded: "{rounded.md}"
---

# Design System: Gantry

## 1. Overview

**Creative North Star: "The Ready Room"**

Gantry is a calm instrument panel you glance at before starting work, not a dashboard you have to interpret. It exists so one person can answer "what should I be working on right now?" without hopping between five other tools, and later mine the accumulated record for a self-review. Every screen should read at a glance: hierarchy comes from spacing, type scale, and weight, never from decoration competing for attention.

The system explicitly rejects generic SaaS card-grid clichés (identical bordered tiles with icon + heading + text, repeated endlessly), the overly dense spreadsheet feel of an admin data grid, and every AI-slop default: hero-metric templates, gradient text, glassmorphism-as-decoration, side-stripe accent borders. This is a personal daily-use tool for one person, not enterprise software performing scale it doesn't have.

Color is deliberately decoupled from layout. Gantry ships 8 complete themes (Default, Cobalt DOS, Phosphor, Frostline, Nightshade, Canopy, Graphite, Amber), each with a dark and light variant, all swapped live via a single set of `--g-*` CSS custom properties. This document captures the **Default / dark** palette as the canonical reference values — the token *names* and the layout rules apply identically across all 16 palette variants; only the hex values change.

**Key Characteristics:**
- Flat surfaces, tonal layering instead of shadows
- One accent color used sparingly (buttons, active nav state, links) — never as a wash
- Type-scale-and-weight hierarchy, not boxes-around-things
- 8px radius on containers, 6px on list rows, consistent across all 8 themes
- Fully theme-agnostic component styling: everything routes through `--g-*` variables, never a hardcoded hex

## 2. Colors

The Default theme's dark palette is a desaturated blue-gray neutral scale with a single cyan-blue accent used sparingly — this pattern (tinted neutrals + one accent) repeats across all 8 themes with different hues and, in a few themes (Cobalt DOS, Phosphor, Amber), different structural choices like outset borders or monospace type.

### Primary
- **Signal Blue** (`--g-accent`, #339af0): The one accent. Used on primary buttons, active nav item text, links, and pinned-item borders. Nowhere else.

### Neutral
- **Void** (`--g-background`, #1a1b1e): Page background.
- **Undertow** (`--g-sidebar`, #141517): Sidebar/nav background, one step darker than the page — the sidebar recedes.
- **Slate Panel** (`--g-surface`, #25262b): Card/row/panel background, one step lighter than the page — surfaces lift slightly off the background.
- **Seam** (`--g-border`, #2c2e33): 1px borders everywhere; the only structural line in the system.
- **Ash Text** (`--g-text`, #c1c2c5): Primary body text.
- **Dim Ash** (`--g-text-muted`, #909296): Secondary/meta text — timestamps, counts, descriptions.
- **Bright Snow** (`--g-heading`, #f1f3f5): Headings only.
- **Deep Harbor** (`--g-nav-active-bg`, #1c3a5e) / **Harbor Light** (`--g-nav-active-text`, #74c0fc): Active nav item background/text pair.
- **Signal Green** (`--g-success`, #37b24d) / **Signal Red** (`--g-danger`, #f03e3e): Status-only — completion, destructive actions, overdue indicators. Never decorative.

### Named Rules
**The One Accent Rule.** `--g-accent` appears on buttons, active nav state, and links — never as a background wash, never repeated for emphasis elsewhere on the same screen.

**The Theme-Agnostic Rule.** No component may hardcode a hex value. Every color reference goes through a `--g-*` variable so all 8 themes render every screen correctly without per-theme conditional styling.

## 3. Typography

**UI Font:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (Default, Frostline, Nord, Graphite themes)
**Mono Font:** `"Cascadia Code", Consolas, "Courier New", monospace` (Cobalt DOS, Phosphor, Nightshade, Canopy, Amber themes)

**Character:** Each theme picks one font family for both heading and body — there is no separate display face. The mono themes lean into a terminal/CRT character; the sans themes stay neutral system-UI. Hierarchy is carried entirely by size and weight, not by font pairing.

### Hierarchy
- **Heading** (700, Mantine `Title order={2}`, ~28px): Page titles ("Projects", "Settings").
- **Section Label** (600, 13-14px, uppercase, letter-spacing 0.05em, `--g-text-muted`): Widget/section headers ("Quick Launch", "Active Projects").
- **Title/Item** (500-600, 14-16px, `--g-text`): The primary label of a list row or card — a todo title, a project name. This is the piece of information the eye should land on first.
- **Body** (400, 13-14px, `--g-text`): Descriptions, form inputs, general content.
- **Meta/Label** (400, 12px, `--g-text-muted`): Timestamps, counts, secondary badges.

### Named Rules
**The One Loud Line Rule.** Each row or card has exactly one line of text set larger/heavier than the rest — the title. Everything else (badges, dates, project names) is meta and stays at 12-13px muted weight so the title is unmistakably the anchor.

## 4. Elevation

Gantry is flat by default. No `box-shadow` is used anywhere in the codebase. Depth is conveyed entirely through **tonal layering**: `--g-background` → `--g-sidebar` (darker, recedes) and `--g-background` → `--g-surface` (lighter, lifts) plus a single 1px `--g-border` line. There is no hover-elevation, no drop shadow on modals or popovers — Mantine's default overlay/shadow is suppressed in favor of the border-and-tone approach.

### Named Rules
**The Flat-By-Default Rule.** Surfaces never gain a shadow, at rest or on hover. If something needs to read as "on top," give it a tonal shift and a border, not a shadow.

## 5. Components

### Buttons
- **Shape:** 4px radius (Mantine default `sm`).
- **Primary:** `background: var(--g-accent)`, `color: var(--g-accent-text)`.
- **Ghost/Subtle:** transparent background, `--g-text-muted` icon/text color, used for the majority of row-level actions (edit, pin, delete) so the row itself stays quiet until interacted with.
- **Destructive:** Mantine `color="red"` variant, reserved for delete/flush actions — never the default action color.

### Cards / Containers
- **Corner Style:** 8px radius on top-level containers (widget panels, project cards, table wrappers).
- **Background:** `var(--g-surface)`.
- **Shadow Strategy:** none — see Elevation.
- **Border:** `1px solid var(--g-border)` always; this is the only depth cue containers get.
- **Internal Padding:** 16-20px for panel-level containers.

### List Rows (signature pattern — todos, notes, wins, recent items)
- **Corner Style:** 6px radius, slightly tighter than containers so rows read as nested-but-distinct.
- **Background:** `var(--g-surface)`, or a subtle `color-mix(in srgb, var(--g-accent) 8%, var(--g-surface))` tint when the row is pinned/highlighted — the only case a row's background shifts.
- **Structure:** two tiers, not one crowded line. Primary row: status/checkbox icon, title (flex, wraps, always gets the full remaining width), row actions (pin/edit/delete) pinned to the top-right corner — the familiar checkbox-title-actions todo pattern. Secondary row: facts about the item only (due date, priority, project, tags, estimate), indented to align under the title (not the checkbox), tight gap between badges since they're one semantic group. Never let action buttons and info badges share a wrapping row — actions need a fixed, predictable location; badges wrap freely.
- **Border:** `1px solid var(--g-border)`, or `1px solid var(--g-accent)` when pinned.
- **Internal Padding:** 10-12px. Rows in a list get 8px gap between them for breathing room — never stack rows with near-zero gap.

### Inputs / Fields
- **Style:** `background: var(--g-background)`, `1px solid var(--g-border)`, text `var(--g-text)`.
- **Focus:** Mantine default focus ring; no custom glow.

### Navigation
- Sidebar background `var(--g-sidebar)`, one step darker than the page. Inactive items: `var(--g-text-muted)` on transparent. Active item: `var(--g-nav-active-bg)` background, `var(--g-nav-active-text)` text, 6px radius. No underline, no left-border indicator.

## 6. Do's and Don'ts

### Do:
- **Do** put the single most important piece of information (a todo/note/win title) on its own full-width line, larger and heavier than everything else in the row.
- **Do** route every color through a `--g-*` CSS variable — never a literal hex — so all 8 themes render correctly.
- **Do** use 8px radius for containers, 6px for list rows, 4px for buttons, consistently.
- **Do** convey depth with tone (`--g-surface` vs `--g-background`) and a 1px `--g-border`, never a shadow.
- **Do** keep the accent color rare: buttons, active nav, links. That's it.

### Don't:
- **Don't** build generic SaaS card-grid clichés: identical bordered cards with icon + heading + text, repeated endlessly.
- **Don't** make dense lists feel like a spreadsheet — this is a personal dashboard, not an admin data grid.
- **Don't** use side-stripe borders, gradient text, glassmorphism, hero-metric templates, or any other AI-slop default.
- **Don't** squeeze a title into a shared horizontal row with action icons where it can get clipped or shrunk — it needs its own line and the full row width.
- **Don't** add a box-shadow anywhere. Flat is the system.
- **Don't** hardcode a hex value in a component. If a color isn't already a `--g-*` token, that's a sign the design doesn't belong yet.
