# App Themes

Public-facing theme names, paired with the source each one draws inspiration from. Keep this note wherever theme metadata lives (`THEMES.md`, a code comment near the theme config, or a credits page) so the lineage isn't lost, even though the product-facing name doesn't reference the original by name.

Each theme ships as a Dark/Light pair, selected independently from the theme itself (see the theme + mode toggle model discussed for the settings UI).

| App name | Internal id | Inspired by | Notes |
|---|---|---|---|
| **Default** | `modern` | — (original) | The app's own baseline. Not modeled on an external product, so no attribution needed. |
| **Cobalt DOS** | `borland` | Early-1990s Borland IDEs (Turbo C++ / Turbo Pascal) | Blue field, silver chrome, bright accent colors, chunky inset/outset borders. |
| **Phosphor** | `terminal` | Monochrome phosphor CRT terminals | Dark mode is the classic green-on-black monitor look; light mode reimagines the same green as ink on paper (thermal receipt / dot-matrix printout), since CRTs don't have a real "light mode" to draw from. |
| **Afterglow** | `afterglow` | TextMate's "Vibrant Ink" theme, via Rob Conery's lower-contrast Visual Studio port (Consolas, selective bolding) | Replaced Frostline (Nord). Near-black background with warm orange/green accents rather than pure black/white, matching Conery's "lowered contrast" adaptation. No official light variant exists for Vibrant Ink, so light mode is reimagined as warm ink-on-cream-paper, same reasoning as Phosphor/Amber. |
| **Synthwave** | `synthwave` | 80s synthwave/outrun aesthetic (neon magenta/cyan on deep purple) | A general aesthetic genre rather than one specific branded scheme, so the name is kept as-is (same reasoning as Amber/Phosphor). Replaced Nightshade (Dracula), which read as too similar to Petal (Catppuccin) once both shipped. Light pairing has no real-world precedent — reimagined as a pale "sunset paper" variant with the same neon hues darkened for legibility. |
| **Canopy** | `monokai` | The Monokai color scheme | Also a derived light variant, same reasoning as Nightshade. |
| **Graphite** | `onedark` | Atom's One Dark color scheme | Light pairing uses One Dark's real official companion, One Light — not invented. |
| **Amber** | `amber` | Old amber-phosphor CRT terminals (e.g. amber-variant VT220s, early IBM monochrome monitors) | Amber terminals are a general display technology, not a specific branded product, so the name is kept as-is rather than renamed. Light pairing has no real-world precedent (amber CRTs didn't have a light mode), so it's reimagined as amber ink on aged parchment — same reasoning as Phosphor's light mode. |
| **Sundial** | `solarized` | Ethan Schoonover's Solarized palette | Both pairings use Solarized's own official base/accent values (base03/base3 backgrounds, base00/base0 body text); this is the one existing scheme in the set with an official, precisely-tuned light variant baked into the source palette itself. |
| **Terracotta** | `gruvbox` | The Gruvbox color scheme | Warm, retro, earthy — distinct temperature from the cooler Frostline/Graphite pairings. Uses Gruvbox's own "hard contrast" dark background and its official light variant. |
| **Petal** | `catppuccin` | The Catppuccin color scheme (Mocha / Latte) | Pastel, low-contrast-by-design, friendly. Light-mode secondary colors were darkened slightly from the stock Latte values to clear WCAG AA (see contrast note below). |
| **Rosewood** | `rosepine` | The Rosé Pine color scheme (main / Dawn) | Soft rose/gold/pine palette; no canonical "green" in the source scheme, so Success borrows Rosé Pine's teal ("foam"/"pine") instead of introducing an off-palette color. |

## Why rename

The original names (Borland, Monokai, One Dark/One Light, Vibrant Ink, Solarized, Gruvbox, Catppuccin, Rosé Pine) are the identity of existing third-party products or well-known open-source color schemes. Using an app-specific name avoids implying an affiliation, endorsement, or license relationship with those projects, while this document keeps the actual design lineage visible internally and in any public credits/changelog.

## Suggested credit line

If a public-facing credits page or settings panel is added, something like this keeps the attribution honest without embedding it in the theme name itself:

> Some themes are visually inspired by well-known editor and terminal color schemes, including Borland's classic IDEs, Monokai, Atom's One Dark/One Light, TextMate's Vibrant Ink, Solarized, Gruvbox, Catppuccin, and Rosé Pine. All colors were independently reproduced for this app; no assets, code, or trademarks from those projects are used.
