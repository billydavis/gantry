# App Themes

Public-facing theme names, paired with the source each one draws inspiration from. Keep this note wherever theme metadata lives (`THEMES.md`, a code comment near the theme config, or a credits page) so the lineage isn't lost, even though the product-facing name doesn't reference the original by name.

Each theme ships as a Dark/Light pair, selected independently from the theme itself (see the theme + mode toggle model discussed for the settings UI).

| App name | Internal id | Inspired by | Notes |
|---|---|---|---|
| **Default** | `modern` | — (original) | The app's own baseline. Not modeled on an external product, so no attribution needed. |
| **Cobalt DOS** | `borland` | Early-1990s Borland IDEs (Turbo C++ / Turbo Pascal) | Blue field, silver chrome, bright accent colors, chunky inset/outset borders. |
| **Phosphor** | `terminal` | Monochrome phosphor CRT terminals | Dark mode is the classic green-on-black monitor look; light mode reimagines the same green as ink on paper (thermal receipt / dot-matrix printout), since CRTs don't have a real "light mode" to draw from. |
| **Frostline** | `nord` | The Nord color palette | Light pairing uses Nord's own official light layer ("Snow Storm"), not an invented variant. |
| **Nightshade** | `dracula` | The Dracula color scheme | Light pairing is a derived variant — Dracula has no official light counterpart, so this reworks the same hues, darkened for legibility on a light background. |
| **Canopy** | `monokai` | The Monokai color scheme | Also a derived light variant, same reasoning as Nightshade. |
| **Graphite** | `onedark` | Atom's One Dark color scheme | Light pairing uses One Dark's real official companion, One Light — not invented. |
| **Amber** | `amber` | Old amber-phosphor CRT terminals (e.g. amber-variant VT220s, early IBM monochrome monitors) | Amber terminals are a general display technology, not a specific branded product, so the name is kept as-is rather than renamed. Light pairing has no real-world precedent (amber CRTs didn't have a light mode), so it's reimagined as amber ink on aged parchment — same reasoning as Phosphor's light mode. |

## Why rename

The original names (Borland, Dracula, Monokai, Nord, One Dark/One Light) are the identity of existing third-party products or well-known open-source color schemes. Using an app-specific name avoids implying an affiliation, endorsement, or license relationship with those projects, while this document keeps the actual design lineage visible internally and in any public credits/changelog.

## Suggested credit line

If a public-facing credits page or settings panel is added, something like this keeps the attribution honest without embedding it in the theme name itself:

> Some themes are visually inspired by well-known editor and terminal color schemes, including Borland's classic IDEs, Dracula, Monokai, Nord, and Atom's One Dark/One Light. All colors were independently reproduced for this app; no assets, code, or trademarks from those projects are used.
