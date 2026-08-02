import { createContext, useContext, useState, useMemo } from 'react'
import {
  MantineProvider,
  createTheme,
  defaultVariantColorsResolver,
  Modal,
  Drawer,
  Menu,
  Popover,
  type CSSVariablesResolver,
  type VariantColorsResolver,
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { THEMES, getTokens, type ThemeId, type ColorScheme, type ThemeTokens } from './theme-defs'

interface ThemeContextValue {
  themeId: ThemeId
  colorScheme: ColorScheme
  themes: typeof THEMES
  setThemeId: (id: ThemeId) => void
  setColorScheme: (scheme: ColorScheme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const cssVariablesResolver: CSSVariablesResolver = (theme) => {
  const t = theme.other as ThemeTokens
  return {
    variables: {
      '--g-background': t.background,
      '--g-sidebar': t.sidebar,
      '--g-surface': t.surface,
      '--g-border': t.border,
      '--g-text': t.text,
      '--g-text-muted': t.textMuted,
      '--g-heading': t.heading,
      '--g-accent': t.accent,
      '--g-accent-text': t.accentText,
      '--g-nav-active-bg': t.navActiveBg,
      '--g-nav-active-text': t.navActiveText,
      '--g-success': t.success,
      '--g-danger': t.danger,
      '--mantine-color-dimmed': t.textMuted,
    },
    light: {
      '--mantine-color-body': t.background,
    },
    dark: {
      '--mantine-color-body': t.background,
      '--mantine-color-dark-6': t.surface,
      '--mantine-color-dark-7': t.sidebar,
    },
  }
}

// Mantine's built-in `red`/`green`/`gray` semantic colors (used via `color="red"` etc.
// and `notifications.show({ color })`) are remapped here to the active theme's
// --g-danger / --g-success / --g-text-muted tokens, so every existing call site
// tracks each theme's actual hue instead of a fixed Mantine palette. `yellow`/`teal`
// (priority badges) have no dedicated token and intentionally fall through to Mantine's
// defaults below.
const TOKEN_COLOR_MAP: Record<string, keyof ThemeTokens> = {
  red: 'danger',
  green: 'success',
  gray: 'textMuted',
}

const variantColorResolver: VariantColorsResolver = (input) => {
  const t = input.theme.other as ThemeTokens
  const tokenKey = input.color ? TOKEN_COLOR_MAP[input.color] : undefined
  const resolved = tokenKey ? t[tokenKey] : undefined

  if (!resolved) return defaultVariantColorsResolver(input)

  switch (input.variant) {
    case 'filled':
      return { background: resolved, hover: resolved, color: t.accentText, border: resolved }
    case 'light':
      return {
        background: `color-mix(in srgb, ${resolved} 15%, transparent)`,
        hover: `color-mix(in srgb, ${resolved} 25%, transparent)`,
        color: resolved,
        border: 'transparent',
      }
    case 'outline':
      return {
        background: 'transparent',
        hover: `color-mix(in srgb, ${resolved} 10%, transparent)`,
        color: resolved,
        border: resolved,
      }
    case 'subtle':
      return {
        background: 'transparent',
        hover: `color-mix(in srgb, ${resolved} 10%, transparent)`,
        color: resolved,
        border: 'transparent',
      }
    default:
      return defaultVariantColorsResolver(input)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(
    () => (localStorage.getItem('gantry-theme') as ThemeId | null) ?? 'modern'
  )
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    () => (localStorage.getItem('gantry-color-scheme') as ColorScheme | null) ?? 'dark'
  )

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id)
    localStorage.setItem('gantry-theme', id)
  }

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme)
    localStorage.setItem('gantry-color-scheme', scheme)
  }

  const tokens = getTokens(themeId, colorScheme)

  const mantineTheme = useMemo(
    () =>
      createTheme({
        fontFamily: tokens.fontFamily,
        other: tokens,
        variantColorResolver,
        components: {
          Modal: Modal.extend({ defaultProps: { shadow: 'none' } }),
          Drawer: Drawer.extend({ defaultProps: { shadow: 'none' } }),
          Menu: Menu.extend({ defaultProps: { shadow: 'none' } }),
          Popover: Popover.extend({ defaultProps: { shadow: 'none' } }),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeId, colorScheme]
  )

  return (
    <ThemeContext.Provider value={{ themeId, colorScheme, themes: THEMES, setThemeId, setColorScheme }}>
      <MantineProvider
        theme={mantineTheme}
        forceColorScheme={colorScheme}
        cssVariablesResolver={cssVariablesResolver}
      >
        <Notifications />
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  )
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider')
  return ctx
}
