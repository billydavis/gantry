import { createContext, useContext, useState, useMemo } from 'react'
import { MantineProvider, createTheme, type CSSVariablesResolver } from '@mantine/core'
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
    () => createTheme({ fontFamily: tokens.fontFamily, other: tokens }),
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
